const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const reportController = require('../controllers/report.controllers');


router.get('/', protect, adminOnly, reportController.getDashboardReports);

module.exports = router;