import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    subject: { type: String, default: "", trim: true },
    salary: { type: Number, required: true, min: 0 },
    contact: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true }
  },
  {
    timestamps: true
  }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
