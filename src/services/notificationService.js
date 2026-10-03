const Notification = require('../models/Notification');

const createNotification = async ({ io, userId, type, title, message, taskId, link }) => {
  try {
    const notif = await Notification.create({ userId, type, title, message, taskId, link });
    if (io) {
      io.to('user:' + userId.toString()).emit('notification:new', notif);
    }
    return notif;
  } catch (err) {
    console.error('Notification create failed:', err.message);
    return null;
  }
};

const notifyMany = async (io, userIds, payload) => {
  return Promise.all(userIds.map((id) => createNotification({ io, userId: id, ...payload })));
};

module.exports = { createNotification, notifyMany };
