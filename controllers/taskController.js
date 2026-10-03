const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, department } = req.body;

    // Get current user from header
    const userEmail = req.headers['x-user-email'];
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'User email not provided'
      });
    }

    const currentUser = await User.findOne({ email: userEmail });
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate required fields
    if (!title || !description || !assignedTo || !deadline || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    // Create task
    const task = new Task({
      title,
      description,
      createdBy: currentUser._id,
      assignedTo,
      priority: priority || 'Medium',
      deadline,
      department,
      history: [{
        action: 'created',
        userId: currentUser._id,
        userName: currentUser.name,
        newValue: 'Task created'
      }]
    });

    await task.save();

    // Populate user details
    await task.populate('createdBy', 'name email');
    await task.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task: ' + error.message
    });
  }
};

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'];
    const currentUser = await User.findOne({ email: userEmail });

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    let query = {};

    // Apply filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.department) {
      query.department = req.query.department;
    }

    // If user is employee, show only their tasks
    if (currentUser.userType === 'employee') {
      query = {
        ...query,
        $or: [
          { assignedTo: currentUser._id },
          { createdBy: currentUser._id }
        ]
      };
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.userId', 'name email')
      .populate('history.userId', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userEmail = req.headers['x-user-email'];
    const currentUser = await User.findOne({ email: userEmail });

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permission
    if (currentUser.userType !== 'admin' && 
        task.assignedTo.toString() !== currentUser._id.toString() &&
        task.createdBy.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task'
      });
    }

    // Add to history
    task.history.push({
      action: 'status_changed',
      userId: currentUser._id,
      userName: currentUser.name,
      oldValue: task.status,
      newValue: status
    });

    // Update status
    task.status = status;

    if (status === 'Completed') {
      task.completedAt = Date.now();
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const userEmail = req.headers['x-user-email'];
    const currentUser = await User.findOne({ email: userEmail });

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Add comment
    task.comments.push({
      text,
      userId: currentUser._id,
      userName: currentUser.name
    });

    // Add to history
    task.history.push({
      action: 'commented',
      userId: currentUser._id,
      userName: currentUser.name,
      newValue: 'Added a comment'
    });

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      comments: task.comments
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'];
    const currentUser = await User.findOne({ email: userEmail });

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const tasks = await Task.find({
      assignedTo: currentUser._id
    })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  addComment,
  getMyTasks
};