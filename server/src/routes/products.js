const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const auth = require('../middleware/auth');

// All product routes require authentication
router.use(auth);

router.get('/', ctrl.getProducts);
router.get('/stats', ctrl.getDashboardStats);
router.get('/history', ctrl.getHistory);
router.get('/:id', ctrl.getProduct);
router.post('/', ctrl.createProduct);
router.put('/:id', ctrl.updateProduct);
router.patch('/:id/price', ctrl.updatePrice);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.deleteProduct);

module.exports = router;
