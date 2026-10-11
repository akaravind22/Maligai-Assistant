const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { normalise } = require('../utils/queryParser');

const REQUIRED_COLUMNS = ['Product Name'];
const VALID_STATUSES = ['AVAILABLE', 'OUT_OF_STOCK'];

/**
 * Parse uploaded file (xlsx or csv) into row objects
 */
function parseFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  let workbook;
  if (ext === '.csv') {
    workbook = xlsx.readFile(filePath, { type: 'file', raw: false });
  } else {
    workbook = xlsx.readFile(filePath);
  }
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  return rows;
}

/**
 * Validate a single row
 */
function validateRow(row, index) {
  const errors = [];

  const productName = (row['Product Name'] || row['product_name'] || '').toString().trim();
  if (!productName) errors.push(`Row ${index + 2}: Product Name is required`);

  const priceRaw = row['Price'] || row['price'] || '0';
  const price = parseFloat(priceRaw);
  if (isNaN(price) || price < 0) errors.push(`Row ${index + 2}: Invalid price "${priceRaw}"`);

  const status = (row['Status'] || row['status'] || 'AVAILABLE').toString().trim().toUpperCase();
  if (!VALID_STATUSES.includes(status)) {
    errors.push(`Row ${index + 2}: Status must be AVAILABLE or OUT_OF_STOCK, got "${status}"`);
  }

  const sizeRaw = row['Size'] || row['size'] || '';
  if (sizeRaw !== '' && isNaN(parseFloat(sizeRaw))) {
    errors.push(`Row ${index + 2}: Size must be a number, got "${sizeRaw}"`);
  }

  return { isValid: errors.length === 0, errors, cleanData: {
    product_name: productName,
    tamil_name: (row['Tamil Name'] || row['tamil_name'] || '').toString().trim() || null,
    brand: (row['Brand'] || row['brand'] || '').toString().trim() || null,
    size: sizeRaw !== '' ? parseFloat(sizeRaw) : null,
    unit: (row['Unit'] || row['unit'] || '').toString().trim() || null,
    price: isNaN(price) ? 0 : price,
    availability_status: VALID_STATUSES.includes(status) ? status : 'AVAILABLE',
    notes: (row['Notes'] || row['notes'] || '').toString().trim() || null,
    aliases: parseAliases(row['Aliases'] || row['aliases'] || ''),
  }};
}

function parseAliases(raw) {
  if (!raw) return [];
  return raw.toString().split('|').map((a) => a.trim()).filter(Boolean);
}

/**
 * Preview import: validate all rows, return summary + errors
 */
async function previewImport(filePath, originalName) {
  const rows = parseFile(filePath, originalName);
  const totalRows = rows.length;
  const validRows = [];
  const errorRows = [];

  rows.forEach((row, i) => {
    const { isValid, errors, cleanData } = validateRow(row, i);
    if (isValid) {
      validRows.push({ rowIndex: i + 2, data: cleanData });
    } else {
      errorRows.push({ rowIndex: i + 2, errors, rawData: row });
    }
  });

  // Check duplicates within the file
  const seen = new Set();
  validRows.forEach((r) => {
    const key = normalise(r.data.product_name + (r.data.brand || '') + (r.data.size || '') + (r.data.unit || ''));
    if (seen.has(key)) {
      r.duplicateInFile = true;
    }
    seen.add(key);
  });

  return { totalRows, validCount: validRows.length, errorCount: errorRows.length, validRows, errorRows };
}

/**
 * Confirm and execute import
 */
async function confirmImport(validRows, userId, importId) {
  const conn = await pool.getConnection();
  let importedCount = 0;
  try {
    await conn.beginTransaction();

    for (const { data } of validRows) {
      const { product_name, tamil_name, brand, size, unit, price, availability_status, notes, aliases } = data;

      // Insert product (allow duplicates — owner decides)
      const [result] = await conn.execute(
        `INSERT INTO products (product_name, tamil_name, brand, size, unit, price, availability_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product_name, tamil_name, brand, size, unit, price, availability_status, notes]
      );
      const productId = result.insertId;

      // Insert aliases
      for (const alias of aliases) {
        const lang = /[\u0B80-\u0BFF]/.test(alias) ? 'TAMIL' : 'ENGLISH';
        await conn.execute(
          `INSERT IGNORE INTO product_aliases (product_id, alias, normalized_alias, language) VALUES (?, ?, ?, ?)`,
          [productId, alias.trim(), normalise(alias), lang]
        );
      }

      // Log import
      await conn.execute(
        `INSERT INTO inventory_updates (product_id, field_changed, old_value, new_value, changed_by, source)
         VALUES (?, 'CREATED', NULL, ?, ?, 'IMPORT')`,
        [productId, product_name, userId]
      );

      importedCount++;
    }

    // Update import history
    await conn.execute(
      `UPDATE import_history SET status = 'COMPLETED', imported_rows = ? WHERE id = ?`,
      [importedCount, importId]
    );

    await conn.commit();
    return importedCount;
  } catch (err) {
    await conn.rollback();
    await pool.execute(
      `UPDATE import_history SET status = 'FAILED' WHERE id = ?`,
      [importId]
    );
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Generate a sample CSV template
 */
function generateTemplate() {
  const sampleData = [
    { 'Product Name': 'Sugar', 'Tamil Name': 'சர்க்கரை', Brand: '', Size: 1, Unit: 'kg', Price: 48, Status: 'AVAILABLE', Aliases: 'சுகர்|Sugar|Sakkarai', Notes: '' },
    { 'Product Name': 'Aavin Milk', 'Tamil Name': 'ஆவின் பால்', Brand: 'Aavin', Size: 500, Unit: 'ml', Price: 24, Status: 'AVAILABLE', Aliases: 'பால்|Milk|Aavin', Notes: '' },
    { 'Product Name': 'Oreo Biscuit', 'Tamil Name': 'ஓரியோ பிஸ்கட்', Brand: 'Oreo', Size: 120, Unit: 'g', Price: 30, Status: 'OUT_OF_STOCK', Aliases: 'Oreo|பிஸ்கட்', Notes: '' },
  ];
  const ws = xlsx.utils.json_to_sheet(sampleData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Inventory');
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Export all products to Excel
 */
async function exportToExcel() {
  const [products] = await pool.execute(
    `SELECT p.*, GROUP_CONCAT(pa.alias SEPARATOR '|') AS aliases
     FROM products p
     LEFT JOIN product_aliases pa ON pa.product_id = p.id
     GROUP BY p.id
     ORDER BY p.product_name`
  );

  const rows = products.map((p) => ({
    'Product Name': p.product_name,
    'Tamil Name': p.tamil_name || '',
    Brand: p.brand || '',
    Size: p.size || '',
    Unit: p.unit || '',
    Price: p.price,
    Status: p.availability_status,
    Aliases: p.aliases || '',
    Notes: p.notes || '',
  }));

  const ws = xlsx.utils.json_to_sheet(rows);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Inventory');
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { previewImport, confirmImport, generateTemplate, exportToExcel };
