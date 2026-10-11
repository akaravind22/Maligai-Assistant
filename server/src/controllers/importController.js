const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const importService = require('../services/importService');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `import_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.xlsx', '.xls', '.csv'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only .xlsx, .xls, .csv files are allowed'));
  },
}).single('file');

async function previewImport(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'கோப்பு தேர்ந்தெடுக்கவில்லை.' });

    try {
      const preview = await importService.previewImport(req.file.path, req.file.originalname);

      // Create import history record
      const [result] = await pool.execute(
        `INSERT INTO import_history (filename, total_rows, valid_rows, error_rows, status, imported_by, error_details)
         VALUES (?, ?, ?, ?, 'PREVIEW', ?, ?)`,
        [
          req.file.originalname,
          preview.totalRows,
          preview.validCount,
          preview.errorCount,
          req.user.id,
          JSON.stringify(preview.errorRows.map(r => ({ row: r.rowIndex, errors: r.errors }))),
        ]
      );

      res.json({
        success: true,
        importId: result.insertId,
        filePath: req.file.path,
        ...preview,
      });
    } catch (parseErr) {
      console.error('Import preview error:', parseErr);
      res.status(500).json({ success: false, message: 'கோப்பை படிக்க முடியவில்லை: ' + parseErr.message });
    }
  });
}

async function confirmImport(req, res) {
  try {
    const { importId, filePath, originalName } = req.body;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ success: false, message: 'கோப்பு கிடைக்கவில்லை. மீண்டும் பதிவேற்றவும்.' });
    }

    const preview = await importService.previewImport(filePath, originalName || 'import.xlsx');
    const count = await importService.confirmImport(preview.validRows, req.user.id, importId);

    // Cleanup temp file
    try { fs.unlinkSync(filePath); } catch (_) {}

    res.json({ success: true, message: `${count} பொருட்கள் இறக்குமதி செய்யப்பட்டன.`, importedCount: count });
  } catch (err) {
    console.error('confirmImport error:', err);
    res.status(500).json({ success: false, message: 'இறக்குமதி தோல்வியடைந்தது: ' + err.message });
  }
}

async function downloadTemplate(req, res) {
  try {
    const buffer = importService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="maligai-inventory-template.xlsx"');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'டெம்ப்ளேட் உருவாக்க முடியவில்லை.' });
  }
}

async function exportInventory(req, res) {
  try {
    const buffer = await importService.exportToExcel();
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="maligai-inventory-${date}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'ஏற்றுமதி தோல்வியடைந்தது.' });
  }
}

async function getImportHistory(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, filename, total_rows, valid_rows, imported_rows, error_rows, status, created_at
       FROM import_history ORDER BY created_at DESC LIMIT 20`
    );
    res.json({ success: true, history: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'வரலாற்றை பெற முடியவில்லை.' });
  }
}

module.exports = { previewImport, confirmImport, downloadTemplate, exportInventory, getImportHistory };
