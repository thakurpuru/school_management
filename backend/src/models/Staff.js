import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, default: "", trim: true },
    salary: { type: Number, required: true, min: 0 },
    contact: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true }
  },
  {
    timestamps: true
  }
);

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
