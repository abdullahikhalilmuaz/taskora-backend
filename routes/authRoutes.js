const express = require('express');
const router = express.Router();
const { 
  login, 
  registerEmployee, 
  getAllEmployees 
} = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/register
// @desc    Register new employee (Admin only)
// @access  Private (Admin)
router.post('/register', registerEmployee);

// @route   GET /api/auth/employees
// @desc    Get all employees (Admin only)
// @access  Private (Admin)
router.get('/employees', getAllEmployees);

module.exports = router;