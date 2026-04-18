import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "employeeModel"
    },
    employeeModel: {
      type: String,
      required: true,
      enum: ["Teacher", "Staff"]
    },
    slipNumber: {
      type: String,
      required: true,
      unique: true
    },
    monthLabel: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMode: {
      type: String,
      default: "Cash"
    },
    note: {
      type: String,
      default: ""
    },
    pdfPath: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Salary = mongoose.model("Salary", salarySchema);

export default Salary;
