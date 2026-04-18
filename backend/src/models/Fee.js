import mongoose from "mongoose";

const buildLegacyReceiptNumber = () =>
  `FEE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    entryKind: {
      type: String,
      enum: ["due", "payment"],
      required: true
    },
    feeType: {
      type: String,
      enum: ["tuition", "transport", "hostel", "admission", "other", "mixed"],
      default: "mixed"
    },
    monthLabel: {
      type: String,
      default: ""
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    receiptId: {
      type: String,
      default: ""
    },
    receiptNumber: {
      type: String,
      default: buildLegacyReceiptNumber
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMode: {
      type: String,
      default: "Cash"
    },
    source: {
      type: String,
      enum: ["manual", "monthly-auto", "structure-update"],
      default: "manual"
    },
    lineItems: [
      {
        feeType: {
          type: String,
          enum: ["tuition", "transport", "hostel", "admission", "other"]
        },
        label: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ],
    note: {
      type: String,
      default: ""
    },
    collectedBy: {
      type: String,
      default: "Admin"
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

const Fee = mongoose.model("Fee", feeSchema);

export default Fee;
