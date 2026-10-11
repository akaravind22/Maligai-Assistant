const { pool } = require('../config/db');
const { normalise } = require('../utils/queryParser');

/**
 * Get all products with pagination and filters
 */
async function getAllProducts({ page = 1, limit = 50, search = '', status = '', sortBy = 'product_name', sortOrder = 'ASC' }) {
  const offset = (page - 1) * limit;
  const allowedSort = ['product_name', 'tamil_name', 'brand', 'price', 'availability_status', 'updated_at'];
  const allowedOrder = ['ASC', 'DESC'];
  const safeSort = allowedSort.includes(sortBy) ? sortBy : 'product_name';
  const safeOrder = allowedOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

  let whereClause = '';
  const params = [];

  const conditions = [];
  if (search) {
    conditions.push(`(p.product_name LIKE ? OR p.tamil_name LIKE ? OR p.brand LIKE ? OR pa.alias LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status && ['AVAILABLE', 'OUT_OF_STOCK'].includes(status)) {
    conditions.push(`p.availability_status = ?`);
    params.push(status);
  }
  if (conditions.length > 0) whereClause = 'WHERE ' + conditions.join(' AND ');

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) AS total
    FROM products p
    LEFT JOIN product_aliases pa ON pa.product_id = p.id
    ${whereClause}
  `;
  const dataQuery = `
    SELECT DISTINCT p.*, 
      GROUP_CONCAT(DISTINCT pa.alias ORDER BY pa.id SEPARATOR '|') AS aliases
    FROM products p
    LEFT JOIN product_aliases pa ON pa.product_id = p.id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.${safeSort} ${safeOrder}
    LIMIT ? OFFSET ?
  `;

  const [countRows] = await pool.execute(countQuery, params);
  const total = countRows[0].total;
  const [rows] = await pool.execute(dataQuery, [...params, limit, offset]);

  const products = rows.map((p) => ({
    ...p,
    aliases: p.aliases ? p.aliases.split('|') : [],
  }));

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Get a single product by ID
 */
async function getProductById(id) {
  const [rows] = await pool.execute(
    `SELECT p.*, GROUP_CONCAT(pa.alias ORDER BY pa.id SEPARATOR '|') AS aliases
     FROM products p
     LEFT JOIN product_aliases pa ON pa.product_id = p.id
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  );
  if (rows.length === 0) return null;
  const p = rows[0];
  p.aliases = p.aliases ? p.aliases.split('|') : [];
  return p;
}

/**
 * Create a new product
 */
async function createProduct(data, userId, source = 'WEB') {
  const {
    product_name, tamil_name, brand, size, unit, price,
    availability_status = 'AVAILABLE', notes, aliases = []
  } = data;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO products (product_name, tamil_name, brand, size, unit, price, availability_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_name, tamil_name || null, brand || null, size || null, unit || null, price, availability_status, notes || null]
    );
    const productId = result.insertId;

    // Insert aliases
    await saveAliases(conn, productId, aliases);

    // Log creation
    await conn.execute(
      `INSERT INTO inventory_updates (product_id, field_changed, old_value, new_value, changed_by, source)
       VALUES (?, 'CREATED', NULL, ?, ?, ?)`,
      [productId, product_name, userId, source]
    );

    await conn.commit();
    return productId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Update a product
 */
async function updateProduct(id, data, userId, source = 'WEB') {
  const {
    product_name, tamil_name, brand, size, unit, price,
    availability_status, notes, aliases
  } = data;

  const existing = await getProductById(id);
  if (!existing) return false;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `UPDATE products SET
         product_name = ?, tamil_name = ?, brand = ?, size = ?, unit = ?,
         price = ?, availability_status = ?, notes = ?
       WHERE id = ?`,
      [
        product_name ?? existing.product_name,
        tamil_name ?? existing.tamil_name,
        brand ?? existing.brand,
        size ?? existing.size,
        unit ?? existing.unit,
        price ?? existing.price,
        availability_status ?? existing.availability_status,
        notes ?? existing.notes,
        id
      ]
    );

    // Track field changes
    const fields = { product_name, tamil_name, brand, size, unit, price, availability_status, notes };
    for (const [field, newVal] of Object.entries(fields)) {
      if (newVal !== undefined && String(newVal) !== String(existing[field])) {
        await conn.execute(
          `INSERT INTO inventory_updates (product_id, field_changed, old_value, new_value, changed_by, source)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, field, existing[field], newVal, userId, source]
        );
      }
    }

    // Update aliases if provided
    if (aliases !== undefined) {
      await conn.execute(`DELETE FROM product_aliases WHERE product_id = ?`, [id]);
      await saveAliases(conn, id, aliases);
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Update only price
 */
async function updatePrice(id, price, userId, source = 'WEB') {
  const existing = await getProductById(id);
  if (!existing) return false;
  await pool.execute(`UPDATE products SET price = ? WHERE id = ?`, [price, id]);
  await pool.execute(
    `INSERT INTO inventory_updates (product_id, field_changed, old_value, new_value, changed_by, source)
     VALUES (?, 'price', ?, ?, ?, ?)`,
    [id, existing.price, price, userId, source]
  );
  return true;
}

/**
 * Update only availability status
 */
async function updateStatus(id, availability_status, userId, source = 'WEB') {
  const existing = await getProductById(id);
  if (!existing) return false;
  await pool.execute(
    `UPDATE products SET availability_status = ? WHERE id = ?`,
    [availability_status, id]
  );
  await pool.execute(
    `INSERT INTO inventory_updates (product_id, field_changed, old_value, new_value, changed_by, source)
     VALUES (?, 'availability_status', ?, ?, ?, ?)`,
    [id, existing.availability_status, availability_status, userId, source]
  );
  return true;
}

/**
 * Delete a product
 */
async function deleteProduct(id) {
  const [result] = await pool.execute(`DELETE FROM products WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
  const [[totals]] = await pool.execute(
    `SELECT 
       COUNT(*) AS total_products,
       SUM(availability_status = 'AVAILABLE') AS available_count,
       SUM(availability_status = 'OUT_OF_STOCK') AS out_of_stock_count
     FROM products`
  );
  const [recentUpdates] = await pool.execute(
    `SELECT iu.*, p.product_name, p.tamil_name
     FROM inventory_updates iu
     JOIN products p ON p.id = iu.product_id
     ORDER BY iu.created_at DESC
     LIMIT 10`
  );
  return { stats: totals, recentUpdates };
}

/**
 * Helper: Insert aliases in bulk
 */
async function saveAliases(conn, productId, aliases) {
  const validAliases = [...new Set(aliases.filter(Boolean))];
  for (const alias of validAliases) {
    const lang = /[\u0B80-\u0BFF]/.test(alias) ? 'TAMIL' : 'ENGLISH';
    await conn.execute(
      `INSERT IGNORE INTO product_aliases (product_id, alias, normalized_alias, language) VALUES (?, ?, ?, ?)`,
      [productId, alias.trim(), normalise(alias), lang]
    );
  }
}

/**
 * Get inventory update history
 */
async function getHistory(limit = 50) {
  const [rows] = await pool.execute(
    `SELECT iu.*, p.product_name, p.tamil_name
     FROM inventory_updates iu
     JOIN products p ON p.id = iu.product_id
     ORDER BY iu.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

module.exports = {
  getAllProducts, getProductById, createProduct, updateProduct,
  updatePrice, updateStatus, deleteProduct, getDashboardStats, getHistory,
};
