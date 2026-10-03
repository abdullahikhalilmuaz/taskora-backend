const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  addComment,
  getMyTasks
} = require('../controllers/taskController');

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', createTask);

// @route   GET /api/tasks
// @desc    Get all tasks (with filters)
// @access  Private
router.get('/', getTasks);

// @route   GET /api/tasks/my-tasks
// @desc    Get tasks assigned to current user
// @access  Private
router.get('/my-tasks', getMyTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', getTaskById);

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private
router.put('/:id/status', updateTaskStatus);

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', addComment);

module.exports = router;