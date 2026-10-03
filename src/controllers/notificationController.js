const Notification = require('../models/Notification');

const getMyNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = notifs.filter((n) => !n.read).length;
    res.json({ success: true, count: notifs.length, unread, notifications: notifs });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, notification: n });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
};

const clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'All cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markRead, markAllRead, clearAll };
