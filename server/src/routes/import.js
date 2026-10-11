const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/importController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/preview', ctrl.previewImport);
router.post('/confirm', ctrl.confirmImport);
router.get('/template', ctrl.downloadTemplate);
router.get('/export', ctrl.exportInventory);
router.get('/history', ctrl.getImportHistory);

module.exports = router;
