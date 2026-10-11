const express = require('express');
const router = express.Router();
const { query } = require('../controllers/assistantController');
const auth = require('../middleware/auth');

router.post('/query', auth, query);

module.exports = router;
