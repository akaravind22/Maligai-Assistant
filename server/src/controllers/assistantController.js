const { parseQuery } = require('../utils/queryParser');
const { searchProducts } = require('../services/searchService');
const { buildResponse } = require('../utils/responseGenerator');
const { pool } = require('../config/db');

/**
 * Main assistant query endpoint
 * Accepts Tamil/English text, returns Tamil response from database.
 */
async function query(req, res) {
  const { query: queryText, inputType = 'TEXT' } = req.body;

  if (!queryText || !queryText.trim()) {
    return res.status(400).json({ success: false, message: 'வினாவை உள்ளிடவும்.' });
  }

  try {
    // 1. Parse intent and product
    const { intent, productQuery, sizeHint } = parseQuery(queryText);

    // 2. Search database
    let products = await searchProducts(productQuery);

    // 3. If size hint present, prefer matching size
    if (sizeHint && products.length > 1) {
      const unitNorm = sizeHint.unit.toLowerCase();
      const filtered = products.filter((p) => {
        const pUnit = (p.unit || '').toLowerCase();
        const sizeMatch = parseFloat(p.size) === sizeHint.value;
        const unitMatch = pUnit.includes(unitNorm) || unitNorm.includes(pUnit);
        return sizeMatch && unitMatch;
      });
      if (filtered.length > 0) products = filtered;
    }

    // 4. Build Tamil response from DB data only
    const responseTamil = buildResponse(intent, products, productQuery);

    // 5. Determine result status
    let resultStatus = 'NOT_FOUND';
    let recognizedProductId = null;
    if (products.length === 1) { resultStatus = 'FOUND'; recognizedProductId = products[0].id; }
    else if (products.length > 1) { resultStatus = 'MULTIPLE'; }

    // 6. Log search
    const source = inputType === 'VOICE' ? 'MOBILE_VOICE' : (req.headers['x-source'] === 'MOBILE' ? 'MOBILE_TEXT' : 'WEB');
    await pool.execute(
      `INSERT INTO search_history (query_text, recognized_product_id, result_status, source, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [queryText, recognizedProductId, resultStatus, source, req.user?.id || null]
    );

    res.json({
      success: true,
      intent,
      productQuery,
      products: products.slice(0, 5),
      responseTamil,
      resultStatus,
    });

  } catch (err) {
    console.error('Assistant query error:', err);
    res.status(500).json({
      success: false,
      message: 'தற்போது சேவையை அணுக முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      responseTamil: 'தற்போது சேவையை அணுக முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    });
  }
}

module.exports = { query };
