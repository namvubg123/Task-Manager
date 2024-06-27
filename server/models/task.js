import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, require: true },
    date: { type: Date, default: new Date() },
    deadline: { type: Date, default: null },
    priority: {
      type: String,
      default: "Bình thường",
      enum: ["Ưu tiên", "Quan trọng", "Bình thường"],
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "pending", "completed", "late", "expired"],
    },
    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "assigned",
            "started",
            "pending",
            "bug",
            "completed",
            "commented",
          ],
        },
        activity: String,
        date: { type: Date, default: new Date() },
        by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    subTasks: [
      {
        title: String,
        date: {
          type: Date,
          default: function () {
            return new Date();
          },
        },
        tag: String,
      },
    ],
    assets: [String],
    team: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    isTrashed: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
