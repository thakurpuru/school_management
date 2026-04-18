import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: true
    },
    tuitionFee: {
      type: Number,
      default: 0,
      min: 0
    },
    transportFee: {
      type: Number,
      default: 0,
      min: 0
    },
    hostelFee: {
      type: Number,
      default: 0,
      min: 0
    },
    admissionFee: {
      type: Number,
      default: 0,
      min: 0
    },
    otherCharges: [
      {
        label: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);

export default FeeStructure;
