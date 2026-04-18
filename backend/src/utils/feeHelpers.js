import mongoose from "mongoose";
import Fee from "../models/Fee.js";
import FeeStructure from "../models/FeeStructure.js";
import Student from "../models/Student.js";

const buildFeeReference = (prefix = "FEE") =>
  `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

export const getCurrentMonthLabel = (date = new Date()) =>
  date.toLocaleString("en-IN", {
    month: "long",
    year: "numeric"
  });

export const getActiveFeeStructure = async () =>
  FeeStructure.findOne({ isActive: true }).sort({ version: -1 });

export const buildMonthlyLineItems = (feeStructure) => [
  {
    feeType: "tuition",
    label: "Tuition Fee",
    amount: Number(feeStructure?.tuitionFee || 0)
  },
  {
    feeType: "transport",
    label: "Transport Fee",
    amount: Number(feeStructure?.transportFee || 0)
  },
  {
    feeType: "hostel",
    label: "Hostel Fee",
    amount: Number(feeStructure?.hostelFee || 0)
  },
  ...((feeStructure?.otherCharges || []).map((item) => ({
    feeType: "other",
    label: item.label,
    amount: Number(item.amount || 0)
  })))
].filter((item) => item.amount > 0);

export const buildRecurringLineItemsForStudent = (student, feeStructure) => {
  const facilityType = student?.facilityType || "none";
  const lineItems = [
    {
      feeType: "tuition",
      label: "Tuition Fee",
      amount: Number(feeStructure?.tuitionFee || student?.feeSummary?.tuitionFee || 0)
    }
  ];

  if (facilityType === "transport") {
    lineItems.push({
      feeType: "transport",
      label: "Transport Fee",
      amount: Number(feeStructure?.transportFee || student?.feeSummary?.transportFee || 0)
    });
  }

  if (facilityType === "hosteler") {
    lineItems.push({
      feeType: "hostel",
      label: "Hostel Fee",
      amount: Number(feeStructure?.hostelFee || student?.feeSummary?.hostelFee || 0)
    });
  }

  return lineItems.filter((item) => item.amount > 0);
};

export const buildAdmissionLineItems = (feeStructure) =>
  Number(feeStructure?.admissionFee || 0) > 0
    ? [
        {
          feeType: "admission",
          label: "Admission Fee",
          amount: Number(feeStructure.admissionFee)
        }
      ]
    : [];

export const refreshStudentFeeSummary = async (studentId) => {
  const objectId = new mongoose.Types.ObjectId(studentId);
  const [summary, student, activeStructure] = await Promise.all([
    Fee.aggregate([
      {
        $match: {
          studentId: objectId
        }
      },
      {
        $group: {
          _id: "$entryKind",
          totalAmount: { $sum: "$amount" },
          totalDue: { $sum: "$dueAmount" }
        }
      }
    ]),
    Student.findById(studentId),
    getActiveFeeStructure()
  ]);

  if (!student) {
    return null;
  }

  const dueGroup = summary.find((item) => item._id === "due");
  const paymentGroup = summary.find((item) => item._id === "payment");

  student.feeSummary = {
    ...student.feeSummary,
    admissionFee: Number(activeStructure?.admissionFee || student.feeSummary.admissionFee || 0),
    tuitionFee: Number(activeStructure?.tuitionFee || student.feeSummary.tuitionFee || 0),
    transportFee: Number(activeStructure?.transportFee || student.feeSummary.transportFee || 0),
    hostelFee: Number(activeStructure?.hostelFee || student.feeSummary.hostelFee || 0),
    otherCharges: Number(
      (activeStructure?.otherCharges || []).reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ) || student.feeSummary.otherCharges || 0
    ),
    totalAssigned: Number(dueGroup?.totalAmount || 0),
    totalPaid: Number(paymentGroup?.totalAmount || 0),
    totalDue: Number(dueGroup?.totalDue || 0)
  };

  await student.save();
  return student;
};

export const createDueEntriesForStudent = async ({
  student,
  monthLabel,
  source = "manual",
  lineItems = []
}) => {
  const createdEntries = [];

  for (const item of lineItems.filter((entry) => Number(entry.amount || 0) > 0)) {
    const existingDue = await Fee.findOne({
      studentId: student._id,
      entryKind: "due",
      feeType: item.feeType,
      monthLabel
    });

    if (existingDue) {
      continue;
    }

    const dueEntry = await Fee.create({
      studentId: student._id,
      entryKind: "due",
      feeType: item.feeType,
      receiptNumber: buildFeeReference("DUE"),
      monthLabel,
      amount: Number(item.amount),
      paidAmount: 0,
      dueAmount: Number(item.amount),
      source,
      lineItems: [item],
      note: `${item.label} due generated for ${monthLabel}`
    });

    createdEntries.push(dueEntry);
  }

  if (createdEntries.length) {
    await refreshStudentFeeSummary(student._id);
  }

  return createdEntries;
};

export const ensureStudentDueRecords = async (student) => {
  if (!student) {
    return null;
  }

  const existingDueCount = await Fee.countDocuments({
    studentId: student._id,
    entryKind: "due"
  });

  if (existingDueCount > 0) {
    return student;
  }

  const admissionAmount = Number(student.feeSummary?.admissionFee || 0);
  const otherChargesAmount = Number(student.feeSummary?.otherCharges || 0);

  await createDueEntriesForStudent({
    student,
    monthLabel: "Admission",
    source: "manual",
    lineItems: [
      {
        feeType: "admission",
        label: "Admission Fee",
        amount: admissionAmount
      }
    ]
  });

  await createDueEntriesForStudent({
    student,
    monthLabel: getCurrentMonthLabel(),
    source: "manual",
    lineItems: [
      ...buildRecurringLineItemsForStudent(student, null),
      {
        feeType: "other",
        label: "Other Charges",
        amount: otherChargesAmount
      }
    ]
  });

  await refreshStudentFeeSummary(student._id);
  return student;
};

export const applyPaymentToOutstandingDues = async ({ studentId, lineItems }) => {
  const outstandingDues = await Fee.find({
    studentId,
    entryKind: "due",
    dueAmount: { $gt: 0 }
  }).sort({ monthLabel: 1, createdAt: 1 });

  const updatedDues = [];
  const totalPendingDue = outstandingDues.reduce(
    (sum, due) => sum + Number(due.dueAmount || 0),
    0
  );
  const totalPaymentAmount = lineItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  if (totalPaymentAmount > totalPendingDue) {
    return {
      exceedsDue: true,
      totalPendingDue,
      updatedDues: []
    };
  }

  for (const lineItem of lineItems) {
    let remainingAmount = Number(lineItem.amount || 0);

    const matchingDues = outstandingDues.filter(
      (due) => due.feeType === lineItem.feeType && due.dueAmount > 0
    );

    for (const due of matchingDues) {
      if (remainingAmount <= 0) {
        break;
      }

      const appliedAmount = Math.min(due.dueAmount, remainingAmount);
      due.paidAmount += appliedAmount;
      due.dueAmount -= appliedAmount;
      remainingAmount -= appliedAmount;
      await due.save();
      updatedDues.push(due);
    }

    if (remainingAmount > 0) {
      const fallbackDues = outstandingDues.filter((due) => due.dueAmount > 0);

      for (const due of fallbackDues) {
        if (remainingAmount <= 0) {
          break;
        }

        const appliedAmount = Math.min(due.dueAmount, remainingAmount);
        due.paidAmount += appliedAmount;
        due.dueAmount -= appliedAmount;
        remainingAmount -= appliedAmount;
        await due.save();
        updatedDues.push(due);
      }
    }
  }

  await refreshStudentFeeSummary(studentId);
  return {
    exceedsDue: false,
    totalPendingDue,
    updatedDues
  };
};
