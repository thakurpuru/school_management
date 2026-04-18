import Fee from "../models/Fee.js";
import FeeStructure from "../models/FeeStructure.js";
import Student from "../models/Student.js";
import {
  createDueReportPdf,
  createFeeReceiptPdf
} from "../services/pdfService.js";
import {
  applyPaymentToOutstandingDues,
  buildAdmissionLineItems,
  buildRecurringLineItemsForStudent,
  createDueEntriesForStudent,
  ensureStudentDueRecords,
  getActiveFeeStructure,
  getCurrentMonthLabel,
  refreshStudentFeeSummary
} from "../utils/feeHelpers.js";

const buildReceiptNumber = () => `RCPT-${Date.now()}`;

const normalizeOtherCharges = (otherCharges = []) =>
  otherCharges
    .map((item) => ({
      label: String(item.label || "").trim(),
      amount: Number(item.amount || 0)
    }))
    .filter((item) => item.label && item.amount > 0);

const getStudentDueBreakdown = async (studentId) => {
  const dues = await Fee.find({
    studentId,
    entryKind: "due"
  }).sort({ monthLabel: -1, createdAt: -1 });

  const pendingDues = dues.filter((item) => item.dueAmount > 0);
  const currentMonth = getCurrentMonthLabel();

  return {
    dues,
    pendingDues,
    pendingByMonth: pendingDues.reduce((result, item) => {
      if (!result[item.monthLabel]) {
        result[item.monthLabel] = 0;
      }

      result[item.monthLabel] += item.dueAmount;
      return result;
    }, {}),
    currentMonthSuggestion: pendingDues.filter((item) => item.monthLabel === currentMonth)
  };
};

export const getFeeStructure = async (_req, res) => {
  const activeStructure = await getActiveFeeStructure();
  const history = await FeeStructure.find().sort({ version: -1 }).limit(5);

  res.json({
    activeStructure,
    history
  });
};

export const saveFeeStructure = async (req, res) => {
  if (
    req.body.tuitionFee === undefined ||
    req.body.transportFee === undefined ||
    req.body.hostelFee === undefined ||
    req.body.admissionFee === undefined
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const previousStructure = await getActiveFeeStructure();

  if (previousStructure) {
    previousStructure.isActive = false;
    await previousStructure.save();
  }

  const feeStructure = await FeeStructure.create({
    version: Number(previousStructure?.version || 0) + 1,
    tuitionFee: Number(req.body.tuitionFee || 0),
    transportFee: Number(req.body.transportFee || 0),
    hostelFee: Number(req.body.hostelFee || 0),
    admissionFee: Number(req.body.admissionFee || 0),
    otherCharges: normalizeOtherCharges(req.body.otherCharges),
    isActive: true
  });

  const students = await Student.find();
  const monthLabel = req.body.monthLabel || getCurrentMonthLabel();
  let updatedStudents = 0;

  for (const student of students) {
    await createDueEntriesForStudent({
      student,
      monthLabel,
      source: "structure-update",
      lineItems: buildRecurringLineItemsForStudent(student, feeStructure)
    });
    updatedStudents += 1;
  }

  res.status(201).json({
    message: "Fee structure saved and current month dues applied",
    feeStructure,
    updatedStudents,
    monthLabel
  });
};

export const generateMonthlyDues = async (req, res) => {
  const feeStructure = await getActiveFeeStructure();

  if (!feeStructure) {
    res.status(400);
    throw new Error("Create a fee structure before generating monthly dues");
  }

  const monthLabel = req.body.monthLabel || getCurrentMonthLabel();
  const students = await Student.find();
  let createdDueCount = 0;

  for (const student of students) {
    const createdEntries = await createDueEntriesForStudent({
      student,
      monthLabel,
      source: "monthly-auto",
      lineItems: buildRecurringLineItemsForStudent(student, feeStructure)
    });
    createdDueCount += createdEntries.length;
  }

  res.json({
    message: "Monthly dues generated successfully",
    monthLabel,
    createdDueCount
  });
};

export const getStudentFeeOverview = async (req, res) => {
  let student = await Student.findById(req.params.studentId);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  await ensureStudentDueRecords(student);
  student = await refreshStudentFeeSummary(req.params.studentId);

  const [feeStructure, history, dueBreakdown] = await Promise.all([
    getActiveFeeStructure(),
    Fee.find({ studentId: req.params.studentId }).sort({ paymentDate: -1, createdAt: -1 }),
    getStudentDueBreakdown(req.params.studentId)
  ]);

  const suggestedLineItems = [
    ...buildRecurringLineItemsForStudent(student, feeStructure),
    ...buildAdmissionLineItems(feeStructure)
  ];

  res.json({
    student,
    feeStructure,
    history,
    pendingDues: dueBreakdown.pendingDues,
    pendingByMonth: dueBreakdown.pendingByMonth,
    suggestedLineItems,
    currentMonthSuggestion: dueBreakdown.currentMonthSuggestion
  });
};

export const payStudentFee = async (req, res) => {
  if (!req.params.studentId) {
    res.status(400);
    throw new Error("Please select a student");
  }

  let student = await Student.findById(req.params.studentId);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  await ensureStudentDueRecords(student);
  student = await refreshStudentFeeSummary(req.params.studentId);

  const lineItems = (req.body.lineItems || [])
    .map((item) => ({
      feeType: item.feeType,
      label: item.label,
      amount: Number(item.amount || 0)
    }))
    .filter((item) => item.label && item.amount > 0);

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  if (!totalAmount) {
    res.status(400);
    throw new Error("Amount cannot be empty");
  }

  const paymentResult = await applyPaymentToOutstandingDues({
    studentId: student._id,
    lineItems
  });

  if (paymentResult.exceedsDue) {
    res.status(400);
    throw new Error("Payment amount cannot exceed the student's pending due");
  }

  const receiptReference = buildReceiptNumber();

  const payment = await Fee.create({
    studentId: student._id,
    entryKind: "payment",
    feeType: lineItems.length > 1 ? "mixed" : lineItems[0].feeType,
    monthLabel: req.body.monthLabel || "",
    amount: totalAmount,
    paidAmount: totalAmount,
    dueAmount: 0,
    receiptId: receiptReference,
    receiptNumber: receiptReference,
    paymentDate: req.body.paymentDate || new Date(),
    lineItems,
    note: req.body.note || ""
  });

  const refreshedStudent = await refreshStudentFeeSummary(student._id);
  const pdfPath = await createFeeReceiptPdf({ student: refreshedStudent, fee: payment });
  payment.pdfPath = pdfPath;
  await payment.save();

  res.status(201).json({
    message: "Fee paid successfully",
    payment,
    student: refreshedStudent
  });
};

export const getFeeHistoryForStudent = async (req, res) => {
  const feeHistory = await Fee.find({ studentId: req.params.studentId })
    .sort({ paymentDate: -1, createdAt: -1 })
    .populate(
      "studentId",
      "studentId personalDetails.studentName personalDetails.aadharNumber academicDetails.className academicDetails.section"
    );

  res.json(feeHistory);
};

export const generateDueReport = async (req, res) => {
  const studentId = req.query.studentId || "";
  const studentFilter = studentId ? { _id: studentId } : {};
  const students = await Student.find(studentFilter);

  if (!students.length) {
    res.status(404);
    throw new Error("No students found for due report");
  }

  const reportRows = [];

  for (const student of students) {
    const pendingDues = await Fee.find({
      studentId: student._id,
      entryKind: "due",
      dueAmount: { $gt: 0 }
    }).sort({ monthLabel: 1, createdAt: 1 });

    if (!pendingDues.length && !studentId) {
      continue;
    }

    reportRows.push({
      student,
      pendingDues
    });
  }

  if (!reportRows.length) {
    res.status(404);
    throw new Error("No pending dues found");
  }

  const pdfPath = await createDueReportPdf({
    title: studentId ? "Student Due Report" : "School Due Report",
    rows: reportRows
  });

  res.json({
    message: "Due report generated successfully",
    pdfPath
  });
};
