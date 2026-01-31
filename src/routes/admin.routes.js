const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/dashboard', protect, adminOnly, dashboardController.getDashboardStats);

module.exports = router;