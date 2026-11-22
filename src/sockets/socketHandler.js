const Message = require('../models/Message');
const User = require('../models/User');
const Task = require('../models/Task');
const { createNotification } = require('../services/notificationService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('user:join', async ({ email }) => {
      if (!email) return;
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) return;
      socket.join('user:' + user._id.toString());
      socket.userId = user._id.toString();
    });

    socket.on('task:join', ({ taskId }) => {
      if (taskId) socket.join('task:' + taskId);
    });

    socket.on('task:leave', ({ taskId }) => {
      if (taskId) socket.leave('task:' + taskId);
    });

    socket.on('chat:send', async ({ taskId, email, text }) => {
      try {
        if (!taskId || !email || !text) return;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return;
        const task = await Task.findById(taskId);
        if (!task) return;

        const msg = await Message.create({
          taskId,
          senderId: user._id,
          senderName: user.name,
          senderAvatar: user.avatar || '',
          text,
        });

        io.to('task:' + taskId).emit('chat:new', msg);

        const recipients = [...new Set([
          task.createdBy.toString(),
          task.assignedTo.toString(),
        ])].filter((uid) => uid !== user._id.toString());

        for (const uid of recipients) {
          await createNotification({
            io,
            userId: uid,
            type: 'message',
            title: 'New message',
            message: user.name + ': ' + text.slice(0, 60),
            taskId,
            link: '/task/' + taskId,
          });
        }
      } catch (err) {
        console.error('chat:send error', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};