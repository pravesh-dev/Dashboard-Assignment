import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String},
  isCompleted: {type: Boolean, default:false},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
