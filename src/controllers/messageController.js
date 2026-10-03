const Message = require('../models/Message');

const getTaskMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTaskMessages };
