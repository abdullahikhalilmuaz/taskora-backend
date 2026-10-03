const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Review', 'Completed', 'On Hold'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    deadline: { type: Date, required: true },
    department: { type: String, required: true },
    tags: [{ type: String }],
    attachments: [
      {
        fileName: String,
        fileType: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        text: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    history: [
      {
        action: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        oldValue: String,
        newValue: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
