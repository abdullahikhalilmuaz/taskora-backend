const User = require('../models/User');

// Simple header-based auth: x-user-email
const requireUser = async (req, res, next) => {
  try {
    const email = req.headers['x-user-email'];
    if (!email) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.userType !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { requireUser, requireAdmin };
