const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification, notifyMany } = require('../services/notificationService');

const io = (req) => req.app.get('io');

const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, deadline, department, tags } = req.body;
    if (!title || !description || !assignedTo || !deadline || !department) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const assignee = await User.findById(assignedTo);
    if (!assignee) return res.status(400).json({ success: false, message: 'Assigned user not found' });

    const task = await Task.create({
      title,
      description,
      createdBy: req.user._id,
      assignedTo,
      priority: priority || 'Medium',
      deadline,
      department,
      tags: tags || [],
      history: [
        {
          action: 'created',
          userId: req.user._id,
          userName: req.user.name,
          newValue: 'Task created',
        },
      ],
    });

    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar department');

    await createNotification({
      io: io(req),
      userId: assignedTo,
      type: 'task_assigned',
      title: 'New task assigned',
      message: req.user.name + ' assigned you: ' + title,
      taskId: task._id,
      link: '/task/' + task._id,
    });

    res.status(201).json({ success: true, message: 'Task created successfully', task });
  } catch (err) {
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, department, assignedTo, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.title = { $regex: search, $options: 'i' };

    if (req.user.userType !== 'admin') {
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar department')
      .sort({ deadline: 1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar department')
      .populate('comments.userId', 'name email avatar')
      .populate('history.userId', 'name email avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const canEdit =
      req.user.userType === 'admin' ||
      task.assignedTo.toString() === req.user._id.toString() ||
      task.createdBy.toString() === req.user._id.toString();
    if (!canEdit) return res.status(403).json({ success: false, message: 'Permission denied' });

    const oldStatus = task.status;
    task.history.push({
      action: 'status_changed',
      userId: req.user._id,
      userName: req.user.name,
      oldValue: oldStatus,
      newValue: status,
    });
    task.status = status;
    if (status === 'Completed') task.completedAt = new Date();
    await task.save();

    const recipients = [task.assignedTo.toString(), task.createdBy.toString()];
    const unique = [...new Set(recipients)].filter((id) => id !== req.user._id.toString());
    await notifyMany(io(req), unique, {
      type: 'task_updated',
      title: 'Task status updated',
      message: req.user.name + ' changed ' + task.title + ' to ' + status,
      taskId: task._id,
      link: '/task/' + task._id,
    });

    res.json({ success: true, message: 'Status updated', task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const allowed = ['title', 'description', 'priority', 'deadline', 'department', 'assignedTo', 'tags'];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) task[k] = req.body[k];
    });
    task.history.push({
      action: 'updated',
      userId: req.user._id,
      userName: req.user.name,
      newValue: 'Task details updated',
    });
    await task.save();
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar department');
    res.json({ success: true, message: 'Task updated', task });
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text required' });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.comments.push({ text, userId: req.user._id, userName: req.user.name });
    task.history.push({
      action: 'commented',
      userId: req.user._id,
      userName: req.user.name,
      newValue: 'Added a comment',
    });
    await task.save();
    await task.populate('comments.userId', 'name email avatar');

    const recipients = [task.assignedTo.toString(), task.createdBy.toString()];
    const unique = [...new Set(recipients)].filter((id) => id !== req.user._id.toString());
    await notifyMany(io(req), unique, {
      type: 'comment',
      title: 'New comment',
      message: req.user.name + ' commented on ' + task.title,
      taskId: task._id,
      link: '/task/' + task._id,
    });

    res.json({ success: true, message: 'Comment added', comments: task.comments });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.userType !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }
    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  addComment,
  deleteTask,
};
