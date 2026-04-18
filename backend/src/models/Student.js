import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true
    },
    personalDetails: {
      studentName: { type: String, required: true, trim: true },
      fatherName: { type: String, required: true, trim: true },
      motherName: { type: String, required: true, trim: true },
      aadharNumber: { type: String, required: true, unique: true, trim: true }
    },
    academicDetails: {
      className: { type: String, required: true },
      section: { type: String, required: true },
      admissionDate: { type: Date, required: true }
    },
    contactDetails: {
      address: { type: String, required: true },
      phoneNumber: { type: String, required: true }
    },
    facilityType: {
      type: String,
      enum: ["hosteler", "transport", "none"],
      required: true,
      default: "none"
    },
    feeSummary: {
      admissionFee: { type: Number, default: 0 },
      tuitionFee: { type: Number, default: 0 },
      transportFee: { type: Number, default: 0 },
      hostelFee: { type: Number, default: 0 },
      otherCharges: { type: Number, default: 0 },
      totalAssigned: { type: Number, default: 0 },
      totalPaid: { type: Number, default: 0 },
      totalDue: { type: Number, default: 0 }
    },
    lastPromotionYear: {
      type: Number,
      default: () => new Date().getFullYear()
    }
  },
  {
    timestamps: true
  }
);

studentSchema.pre("validate", function buildStudentRecord(next) {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const suffix = Math.floor(1000 + Math.random() * 9000);
    this.studentId = `STU-${year}-${suffix}`;
  }

  if (!this.feeSummary.totalAssigned) {
    this.feeSummary.totalAssigned =
      (this.feeSummary.admissionFee || 0) +
      (this.feeSummary.tuitionFee || 0) +
      (this.feeSummary.transportFee || 0) +
      (this.feeSummary.hostelFee || 0) +
      (this.feeSummary.otherCharges || 0);
  }

  this.feeSummary.totalDue = Math.max(
    0,
    (this.feeSummary.totalAssigned || 0) - (this.feeSummary.totalPaid || 0)
  );

  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
