const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getAllUsers,
  getMe,
  updateUser,
  deleteUser,
  resetPassword,
} = require('../controllers/userController');
const { requireUser, requireAdmin } = require('../middleware/auth');

router.get('/me', requireUser, getMe);
router.get('/employees', requireUser, requireAdmin, getAllEmployees);
router.get('/', requireUser, requireAdmin, getAllUsers);
router.put('/:id', requireUser, requireAdmin, updateUser);
router.put('/:id/reset-password', requireUser, requireAdmin, resetPassword);
router.delete('/:id', requireUser, requireAdmin, deleteUser);

module.exports = router;
