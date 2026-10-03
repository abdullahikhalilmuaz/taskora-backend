const express = require('express');
const router = express.Router();
const { getReport, exportReportPDF } = require('../controllers/reportController');
const { requireUser, requireAdmin } = require('../middleware/auth');

router.get('/', requireUser, requireAdmin, getReport);
router.get('/pdf', requireUser, requireAdmin, exportReportPDF);

module.exports = router;
