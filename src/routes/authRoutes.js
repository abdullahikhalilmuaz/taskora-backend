const express = require('express');
const router = express.Router();
const { login, registerEmployee } = require('../controllers/authController');
const { requireUser, requireAdmin } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', requireUser, requireAdmin, registerEmployee);

module.exports = router;
