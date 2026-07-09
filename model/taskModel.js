const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "AuthUsers",
    //   required: true,
    // },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUsers",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUsers",
      required: true,
    },
    images:{
      type: String
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
