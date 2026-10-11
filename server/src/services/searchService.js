/**
 * Product Search Service
 * Handles alias matching, fuzzy search, and product lookup from MySQL.
 */

const { pool } = require('../config/db');
const { normalise } = require('../utils/queryParser');

/**
 * Fuzzy similarity: Levenshtein distance ratio
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const na = normalise(a), nb = normalise(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(na, nb) / maxLen;
}

/**
 * Tokenise Tamil/English mixed text into words
 */
function tokenise(text) {
  return normalise(text).split(/\s+/).filter(Boolean);
}

/**
 * Search products by alias and fuzzy product name
 */
async function searchProducts(productQuery) {
  const normQuery = normalise(productQuery);
  const tokens = tokenise(productQuery);

  if (!normQuery) return [];

  // Step 1: Exact alias match
  const [aliasRows] = await pool.execute(
    `SELECT DISTINCT p.* 
     FROM products p
     JOIN product_aliases pa ON pa.product_id = p.id
     WHERE pa.normalized_alias = ? OR pa.alias = ?`,
    [normQuery, productQuery]
  );
  if (aliasRows.length > 0) return rankResults(aliasRows, productQuery);

  // Step 2: Partial alias match
  const [partialAlias] = await pool.execute(
    `SELECT DISTINCT p.* 
     FROM products p
     JOIN product_aliases pa ON pa.product_id = p.id
     WHERE pa.normalized_alias LIKE ? OR pa.alias LIKE ?`,
    [`%${normQuery}%`, `%${productQuery}%`]
  );
  if (partialAlias.length > 0) return rankResults(partialAlias, productQuery);

  // Step 3: Direct product name match
  const [nameRows] = await pool.execute(
    `SELECT * FROM products 
     WHERE LOWER(product_name) LIKE ? 
        OR tamil_name LIKE ?
        OR LOWER(brand) LIKE ?`,
    [`%${normQuery}%`, `%${productQuery}%`, `%${normQuery}%`]
  );
  if (nameRows.length > 0) return rankResults(nameRows, productQuery);

  // Step 4: Token-based alias search
  if (tokens.length > 0) {
    const tokenResults = await tokenSearch(tokens, productQuery);
    if (tokenResults.length > 0) return tokenResults;
  }

  // Step 5: Fuzzy fallback against all aliases
  return await fuzzySearch(productQuery);
}

/**
 * Token-based search: at least one token must match
 */
async function tokenSearch(tokens, originalQuery) {
  const results = new Map();
  for (const token of tokens) {
    if (token.length < 2) continue;
    const [rows] = await pool.execute(
      `SELECT DISTINCT p.* 
       FROM products p
       JOIN product_aliases pa ON pa.product_id = p.id
       WHERE pa.normalized_alias LIKE ? OR pa.alias LIKE ?
          OR LOWER(p.product_name) LIKE ? OR p.tamil_name LIKE ?`,
      [`%${normalise(token)}%`, `%${token}%`, `%${normalise(token)}%`, `%${token}%`]
    );
    for (const row of rows) {
      if (!results.has(row.id)) results.set(row.id, row);
    }
  }
  const arr = Array.from(results.values());
  return rankResults(arr, originalQuery);
}

/**
 * Fuzzy search against all product names and aliases
 */
async function fuzzySearch(query) {
  const THRESHOLD = 0.55;
  const [allProducts] = await pool.execute(
    `SELECT p.*, GROUP_CONCAT(pa.alias SEPARATOR '|') AS all_aliases
     FROM products p
     LEFT JOIN product_aliases pa ON pa.product_id = p.id
     GROUP BY p.id`
  );

  const scored = allProducts
    .map((p) => {
      const candidates = [
        p.product_name,
        p.tamil_name,
        p.brand,
        ...(p.all_aliases ? p.all_aliases.split('|') : []),
      ].filter(Boolean);

      const maxSim = Math.max(...candidates.map((c) => similarity(query, c)));
      return { product: p, score: maxSim };
    })
    .filter((r) => r.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((r) => r.product);
}

/**
 * Rank results: available products first, then by name relevance
 */
function rankResults(products, query) {
  const normQ = normalise(query);
  return products
    .map((p) => {
      let score = similarity(query, p.product_name) + similarity(query, p.tamil_name || '');
      if (p.availability_status === 'AVAILABLE') score += 0.1;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}

/**
 * Get product by ID with aliases
 */
async function getProductById(id) {
  const [rows] = await pool.execute(
    `SELECT p.*, GROUP_CONCAT(pa.alias SEPARATOR '|') AS aliases
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

module.exports = { searchProducts, getProductById, fuzzySearch };
