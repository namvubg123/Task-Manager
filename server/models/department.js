import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
