const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Demo login (no authentication required)
router.post('/demo-login', authController.demoLogin);

module.exports = router; 