const User = require('../models/User');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      department: user.department,
      employeeId: user.employeeId,
      designation: user.designation
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Register new employee (Admin only)
// @route   POST /api/auth/register
// @access  Private (Admin only)
const registerEmployee = async (req, res) => {
  try {
    const { name, email, password, department, employeeId, designation } = req.body;

    // Check if the person making the request is an admin
    // We'll get the admin info from the request header
    const adminEmail = req.headers['x-admin-email']; // Simple for demo
    
    if (!adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }

    // Verify that the requester is actually an admin
    const admin = await User.findOne({ email: adminEmail, userType: 'admin' });
    
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can create new users.'
      });
    }

    // Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and department'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employeeId already exists (if provided)
    if (employeeId) {
      const existingEmpId = await User.findOne({ employeeId });
      if (existingEmpId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Create new employee
    const user = await User.create({
      name,
      email,
      password, // Stored as plain text as per your simplification
      userType: 'employee', // Force to employee
      department,
      employeeId: employeeId || `EMP${Date.now()}`,
      designation: designation || 'Staff',
      createdBy: admin._id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        department: user.department,
        employeeId: user.employeeId,
        designation: user.designation
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Get all employees (Admin only)
// @route   GET /api/auth/employees
// @access  Private (Admin only)
const getAllEmployees = async (req, res) => {
  try {
    const adminEmail = req.headers['x-admin-email'];
    
    // if (!adminEmail) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Unauthorized. Admin access required.'
    //   });
    // }

    const admin = await User.findOne({ email: adminEmail, userType: 'admin' });
    
    // if (!admin) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied. Only administrators can view employees.'
    //   });
    // }

    const employees = await User.find({ userType: 'employee' }).select('-password');
    
    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  login,
  registerEmployee,
  getAllEmployees
};