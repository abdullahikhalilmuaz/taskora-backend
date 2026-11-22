const mongoose = require("mongoose");

const PersonalTaskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Review", "Completed", "On Hold"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    deadline: { type: Date, required: true },
    tags: [{ type: String }],
    completedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PersonalTask", PersonalTaskSchema);
