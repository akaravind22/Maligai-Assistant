/**
 * Tamil Response Generator
 * Builds natural Tamil sentences from database results.
 * NEVER invents prices or availability — always uses DB data.
 */

/**
 * Format size string naturally in Tamil
 */
function formatSize(size, unit) {
  if (!size) return '';

  const unitMap = {
    kg: 'கிலோ',
    g: 'கிராம்',
    l: 'லிட்டர்',
    L: 'லிட்டர்',
    ml: 'மில்லி',
    piece: 'துண்டு',
    pieces: 'துண்டுகள்',
  };

  const tamilUnit = unitMap[unit] || unit;
  const sizeVal = parseFloat(size);
  // Format: remove trailing zeros (1.000 → 1, 500.000 → 500)
  const displaySize = sizeVal % 1 === 0 ? sizeVal.toFixed(0) : sizeVal.toString();
  return `${displaySize} ${tamilUnit}`;
}

/**
 * Format price in Tamil
 */
function formatPrice(price) {
  const p = parseFloat(price);
  return p % 1 === 0 ? p.toFixed(0) : p.toFixed(2);
}

/**
 * Get Tamil display name for a product
 */
function getDisplayName(product) {
  return product.tamil_name || product.product_name;
}

/**
 * Build a Tamil response for CHECK_AVAILABILITY or CHECK_PRODUCT intent
 */
function buildAvailabilityResponse(product) {
  const name = getDisplayName(product);
  const sizeStr = product.size ? formatSize(product.size, product.unit) : '';
  const priceStr = formatPrice(product.price);
  const brand = product.brand ? `${product.brand} ` : '';

  if (product.availability_status === 'AVAILABLE') {
    let resp = `ஆம், ${brand}${name} இருக்கு.`;
    if (sizeStr) {
      resp += ` ${sizeStr} விலை ${priceStr} ரூபாய்.`;
    } else {
      resp += ` விலை ${priceStr} ரூபாய்.`;
    }
    return resp;
  } else {
    return `${brand}${name} தற்போது இல்லை.`;
  }
}

/**
 * Build a Tamil response for CHECK_PRICE intent
 */
function buildPriceResponse(product) {
  const name = getDisplayName(product);
  const sizeStr = product.size ? formatSize(product.size, product.unit) : '';
  const priceStr = formatPrice(product.price);
  const brand = product.brand ? `${product.brand} ` : '';

  if (product.availability_status === 'OUT_OF_STOCK') {
    return `${brand}${name} தற்போது இல்லை. கடைசி விலை ${priceStr} ரூபாய் இருந்தது.`;
  }

  if (sizeStr) {
    return `${sizeStr} ${brand}${name} விலை ${priceStr} ரூபாய்.`;
  }
  return `${brand}${name} விலை ${priceStr} ரூபாய்.`;
}

/**
 * Build a multi-product response when several products match
 */
function buildMultipleProductsResponse(products) {
  const names = products.map((p, i) => {
    const name = getDisplayName(p);
    const sizeStr = p.size ? formatSize(p.size, p.unit) : '';
    const brand = p.brand ? `${p.brand} ` : '';
    const status = p.availability_status === 'AVAILABLE' ? '✅' : '❌';
    return `${i + 1}. ${status} ${brand}${name}${sizeStr ? ' ' + sizeStr : ''} - ₹${formatPrice(p.price)}`;
  });
  return `பல பொருட்கள் உள்ளன:\n\n${names.join('\n')}`;
}

/**
 * Product not found in DB
 */
function buildNotFoundResponse(query) {
  return `"${query}" பட்டியலில் கிடைக்கவில்லை.`;
}

/**
 * Server unavailable
 */
function buildServerErrorResponse() {
  return 'தற்போது சேவையை அணுக முடியவில்லை. மீண்டும் முயற்சிக்கவும்.';
}

/**
 * No internet
 */
function buildNoInternetResponse() {
  return 'இணைய இணைப்பு இல்லை. மீண்டும் முயற்சிக்கவும்.';
}

/**
 * Speech not recognised
 */
function buildSpeechErrorResponse() {
  return 'உங்கள் குரலை சரியாக புரிந்துகொள்ள முடியவில்லை. மீண்டும் சொல்லுங்கள்.';
}

/**
 * Main response builder
 */
function buildResponse(intent, products, query) {
  if (!products || products.length === 0) {
    return buildNotFoundResponse(query);
  }
  if (products.length > 1) {
    return buildMultipleProductsResponse(products);
  }
  const product = products[0];
  if (intent === 'CHECK_PRICE') {
    return buildPriceResponse(product);
  }
  return buildAvailabilityResponse(product);
}

module.exports = {
  buildResponse,
  buildAvailabilityResponse,
  buildPriceResponse,
  buildMultipleProductsResponse,
  buildNotFoundResponse,
  buildServerErrorResponse,
  buildNoInternetResponse,
  buildSpeechErrorResponse,
  formatSize,
  formatPrice,
  getDisplayName,
};
