const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

router.get('/', protect, adminOnly, userController.getAllUsers);

module.exports = router;