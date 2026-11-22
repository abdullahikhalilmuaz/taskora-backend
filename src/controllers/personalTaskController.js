const PersonalTask = require("../models/PersonalTask");

const createPersonalTask = async (req, res, next) => {
  try {
    const { title, description, priority, deadline, tags } = req.body;
    if (!title || !description || !deadline) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Title, description and deadline are required",
        });
    }
    const task = await PersonalTask.create({
      owner: req.user._id,
      title,
      description,
      priority: priority || "Medium",
      deadline,
      tags: tags || [],
    });
    res.status(201).json({ success: true, message: "Task created", task });
  } catch (err) {
    next(err);
  }
};

const getMyPersonalTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const tasks = await PersonalTask.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

const getPersonalTaskById = async (req, res, next) => {
  try {
    const task = await PersonalTask.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

const updatePersonalTask = async (req, res, next) => {
  try {
    const task = await PersonalTask.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    const allowed = [
      "title",
      "description",
      "priority",
      "deadline",
      "tags",
      "status",
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) task[k] = req.body[k];
    });

    if (req.body.status === "Completed" && !task.completedAt) {
      task.completedAt = new Date();
    } else if (req.body.status && req.body.status !== "Completed") {
      task.completedAt = undefined;
    }

    await task.save();
    res.json({ success: true, message: "Task updated", task });
  } catch (err) {
    next(err);
  }
};

const updatePersonalTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status)
      return res
        .status(400)
        .json({ success: false, message: "Status required" });
    const task = await PersonalTask.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    task.status = status;
    task.completedAt = status === "Completed" ? new Date() : undefined;
    await task.save();
    res.json({ success: true, message: "Status updated", task });
  } catch (err) {
    next(err);
  }
};

const deletePersonalTask = async (req, res, next) => {
  try {
    const task = await PersonalTask.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPersonalTask,
  getMyPersonalTasks,
  getPersonalTaskById,
  updatePersonalTask,
  updatePersonalTaskStatus,
  deletePersonalTask,
};
