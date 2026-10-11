const productService = require('../services/productService');

async function getProducts(req, res) {
  try {
    const { page = 1, limit = 50, search = '', status = '', sortBy = 'product_name', sortOrder = 'ASC' } = req.query;
    const result = await productService.getAllProducts({
      page: parseInt(page), limit: parseInt(limit), search, status, sortBy, sortOrder
    });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: 'பொருட்களை பெற முடியவில்லை.' });
  }
}

async function getProduct(req, res) {
  try {
    const product = await productService.getProductById(parseInt(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'பொருள் கிடைக்கவில்லை.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'சேவை பிழை.' });
  }
}

async function createProduct(req, res) {
  try {
    const { product_name, price } = req.body;
    if (!product_name) return res.status(400).json({ success: false, message: 'பொருள் பெயர் தேவை.' });
    if (price === undefined || price === null || price < 0) {
      return res.status(400).json({ success: false, message: 'சரியான விலை தேவை.' });
    }
    const source = req.headers['x-source'] === 'MOBILE' ? 'MOBILE' : 'WEB';
    const id = await productService.createProduct(req.body, req.user.id, source);
    const product = await productService.getProductById(id);
    res.status(201).json({ success: true, message: 'பொருள் சேர்க்கப்பட்டது.', product });
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ success: false, message: 'பொருள் சேர்க்க முடியவில்லை.' });
  }
}

async function updateProduct(req, res) {
  try {
    const id = parseInt(req.params.id);
    const source = req.headers['x-source'] === 'MOBILE' ? 'MOBILE' : 'WEB';
    const updated = await productService.updateProduct(id, req.body, req.user.id, source);
    if (!updated) return res.status(404).json({ success: false, message: 'பொருள் கிடைக்கவில்லை.' });
    const product = await productService.getProductById(id);
    res.json({ success: true, message: 'பொருள் புதுப்பிக்கப்பட்டது.', product });
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ success: false, message: 'புதுப்பிக்க முடியவில்லை.' });
  }
}

async function updatePrice(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { price } = req.body;
    if (price === undefined || price < 0) {
      return res.status(400).json({ success: false, message: 'சரியான விலை தேவை.' });
    }
    const source = req.headers['x-source'] === 'MOBILE' ? 'MOBILE' : 'WEB';
    const ok = await productService.updatePrice(id, price, req.user.id, source);
    if (!ok) return res.status(404).json({ success: false, message: 'பொருள் கிடைக்கவில்லை.' });
    res.json({ success: true, message: 'விலை மாற்றப்பட்டது.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'விலை மாற்ற முடியவில்லை.' });
  }
}

async function updateStatus(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { availability_status } = req.body;
    if (!['AVAILABLE', 'OUT_OF_STOCK'].includes(availability_status)) {
      return res.status(400).json({ success: false, message: 'நிலை AVAILABLE அல்லது OUT_OF_STOCK ஆக இருக்க வேண்டும்.' });
    }
    const source = req.headers['x-source'] === 'MOBILE' ? 'MOBILE' : 'WEB';
    const ok = await productService.updateStatus(id, availability_status, req.user.id, source);
    if (!ok) return res.status(404).json({ success: false, message: 'பொருள் கிடைக்கவில்லை.' });
    res.json({ success: true, message: 'நிலை மாற்றப்பட்டது.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'நிலை மாற்ற முடியவில்லை.' });
  }
}

async function deleteProduct(req, res) {
  try {
    const id = parseInt(req.params.id);
    const ok = await productService.deleteProduct(id);
    if (!ok) return res.status(404).json({ success: false, message: 'பொருள் கிடைக்கவில்லை.' });
    res.json({ success: true, message: 'பொருள் நீக்கப்பட்டது.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'நீக்க முடியவில்லை.' });
  }
}

async function getDashboardStats(req, res) {
  try {
    const data = await productService.getDashboardStats();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'புள்ளிவிவரங்களை பெற முடியவில்லை.' });
  }
}

async function getHistory(req, res) {
  try {
    const { limit = 50 } = req.query;
    const history = await productService.getHistory(parseInt(limit));
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'வரலாற்றை பெற முடியவில்லை.' });
  }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, updatePrice, updateStatus, deleteProduct, getDashboardStats, getHistory };
