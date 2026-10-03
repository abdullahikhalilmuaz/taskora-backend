const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'comment', 'overdue', 'due_soon', 'message', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
