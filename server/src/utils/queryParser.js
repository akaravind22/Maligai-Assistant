/**
 * Tamil Query Understanding Module
 * Identifies intent and product from Tamil/English natural language queries.
 * Uses keyword matching - no external AI. All inventory data comes from MySQL.
 */

// Keywords that indicate price enquiry
const PRICE_KEYWORDS = [
  'விலை', 'என்ன விலை', 'rate', 'price', 'cost', 'ரேட்', 'பாரு', 'எவ்வளவு',
  'how much', 'எவ்ளோ', 'என்ன', 'கோட்டம்',
];

// Keywords that indicate availability check
const AVAILABILITY_KEYWORDS = [
  'இருக்கா', 'இருக்கிறதா', 'கிடைக்குமா', 'available', 'stock', 'இல்லையா',
  'வேண்டும்', 'கொடுங்க', 'தா', 'பாரு',
];

// Keywords for update intents (future use)
const OUT_OF_STOCK_KEYWORDS = ['இல்லை', 'தீர்ந்துவிட்டது', 'கிடையாது', 'out of stock'];
const UPDATE_PRICE_KEYWORDS = ['விலை மாற்று', 'update price', 'change price'];

/**
 * Normalise text: lowercase, trim, collapse spaces
 */
function normalise(text) {
  return (text || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Detect intent from query
 */
function detectIntent(query) {
  const q = normalise(query);

  // Check price keywords
  for (const kw of PRICE_KEYWORDS) {
    if (q.includes(normalise(kw))) return 'CHECK_PRICE';
  }
  // Check availability keywords
  for (const kw of AVAILABILITY_KEYWORDS) {
    if (q.includes(normalise(kw))) return 'CHECK_AVAILABILITY';
  }
  // Update intents (for future use — not executed without confirmation)
  for (const kw of OUT_OF_STOCK_KEYWORDS) {
    if (q.includes(normalise(kw))) return 'UPDATE_AVAILABILITY';
  }
  for (const kw of UPDATE_PRICE_KEYWORDS) {
    if (q.includes(normalise(kw))) return 'UPDATE_PRICE';
  }
  // Default: check product
  return 'CHECK_PRODUCT';
}

/**
 * Strip common Tamil question/filler words to extract core product name
 */
function extractProductQuery(query) {
  let q = query.trim();

  // Remove question marks
  q = q.replace(/[?？]/g, '');

  // Tamil filler removal
  const fillers = [
    'என்ன விலை', 'என்ன', 'விலை', 'இருக்கா', 'இருக்கிறதா', 'கிடைக்குமா',
    'கொடுங்க', 'வேண்டும்', 'பாரு', 'ஒரு கிலோ', 'ஒரு லிட்டர்', 'ஒரு',
    'how much', 'available', 'stock', 'price', 'rate', 'இல்லையா',
    'எவ்வளவு', 'எவ்ளோ', 'தா',
  ];

  // Sort by length desc to remove longer phrases first
  fillers.sort((a, b) => b.length - a.length);

  let cleaned = q;
  for (const filler of fillers) {
    const re = new RegExp(filler, 'gi');
    cleaned = cleaned.replace(re, '').trim();
  }

  return cleaned.trim() || q.trim();
}

/**
 * Extract size hint from query (e.g. "1 kg", "500 ml")
 */
function extractSizeHint(query) {
  const sizePattern = /(\d+(?:\.\d+)?)\s*(kg|g|l|ml|liter|litre|கிலோ|கிலோகிராம்|கிராம்|லிட்டர்|மில்லி)/i;
  const match = query.match(sizePattern);
  if (match) {
    return { value: parseFloat(match[1]), unit: match[2].toLowerCase() };
  }
  return null;
}

/**
 * Main query parse function
 */
function parseQuery(queryText) {
  const intent = detectIntent(queryText);
  const productQuery = extractProductQuery(queryText);
  const sizeHint = extractSizeHint(queryText);

  return { intent, productQuery, sizeHint, originalQuery: queryText };
}

module.exports = { parseQuery, normalise, detectIntent, extractProductQuery };
