const Message = require("../models/Message");
const Task = require("../models/Task");
const User = require("../models/User");

const getTaskMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ taskId: req.params.taskId }).sort({
      createdAt: 1,
    });
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

// REST fallback: send message without socket
const postTaskMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ success: false, message: "Text required" });

    const user = await User.findOne({ email: req.headers["x-user-email"] });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    const task = await Task.findById(req.params.taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    const msg = await Message.create({
      taskId: req.params.taskId,
      senderId: user._id,
      senderName: user.name,
      senderAvatar: user.avatar || "",
      text,
    });

    // Emit to socket room if io is available
    const io = req.app.get("io");
    if (io) {
      io.to("task:" + req.params.taskId).emit("chat:new", msg);
      const recipients = [
        task.createdBy.toString(),
        task.assignedTo.toString(),
      ];
      recipients.forEach((uid) => {
        if (uid !== user._id.toString()) {
          io.to("user:" + uid).emit("notification:new", {
            _id: msg._id,
            type: "message",
            title: "New message",
            message: user.name + ": " + text.slice(0, 60),
            taskId: task._id,
            read: false,
            createdAt: msg.createdAt,
          });
        }
      });
    }

    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTaskMessages, postTaskMessage };
