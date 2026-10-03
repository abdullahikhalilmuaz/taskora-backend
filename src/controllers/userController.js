const User = require('../models/User');
const { cleanUser } = require('../utils/helpers');

const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ userType: 'employee' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, employees });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: cleanUser(req.user) });
};

const updateUser = async (req, res, next) => {
  try {
    const allowed = ['name', 'department', 'designation', 'phone', 'avatar', 'isActive'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an admin account' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ success: false, message: 'newPassword required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEmployees, getAllUsers, getMe, updateUser, deleteUser, resetPassword };
