const User = require('../models/User');
const { cleanUser } = require('../utils/helpers');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    user.lastLogin = new Date();
    await user.save();
    return res.json({ success: true, message: 'Login successful', user: cleanUser(user) });
  } catch (err) {
    next(err);
  }
};

// Admin only: register employee
const registerEmployee = async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can register employees' });
    }
    const { name, email, password, department, employeeId, designation, phone } = req.body;
    if (!name || !email || !password || !department) {
      return res.status(400).json({ success: false, message: 'Name, email, password and department are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    if (employeeId) {
      const dup = await User.findOne({ employeeId });
      if (dup) return res.status(400).json({ success: false, message: 'Employee ID already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      userType: 'employee',
      department,
      employeeId: employeeId || 'EMP' + Date.now(),
      designation: designation || 'Staff',
      phone: phone || '',
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Employee created successfully', user: cleanUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, registerEmployee };
