const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  addComment,
  deleteTask,
} = require('../controllers/taskController');
const { requireUser } = require('../middleware/auth');

router.post('/', requireUser, createTask);
router.get('/', requireUser, getTasks);
router.get('/my-tasks', requireUser, getMyTasks);
router.get('/:id', requireUser, getTaskById);
router.put('/:id', requireUser, updateTask);
router.put('/:id/status', requireUser, updateTaskStatus);
router.post('/:id/comments', requireUser, addComment);
router.delete('/:id', requireUser, deleteTask);

module.exports = router;
