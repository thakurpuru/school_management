import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import { getNextClass } from "../utils/classUpgrade.js";
import {
  buildRecurringLineItemsForStudent,
  createDueEntriesForStudent,
  getCurrentMonthLabel,
  refreshStudentFeeSummary
} from "../utils/feeHelpers.js";

const isValidAadhar = (value = "") => /^\d{12}$/.test(String(value).trim());

const validateStudentPayload = ({
  personalDetails,
  academicDetails,
  contactDetails,
  facilityType
}) => {
  const requiredFields = [
    personalDetails?.studentName,
    personalDetails?.fatherName,
    personalDetails?.motherName,
    personalDetails?.aadharNumber,
    academicDetails?.className,
    academicDetails?.section,
    academicDetails?.admissionDate,
    contactDetails?.address,
    contactDetails?.phoneNumber,
    facilityType
  ];

  if (requiredFields.some((field) => !String(field || "").trim())) {
    throw new Error("All fields are required");
  }

  if (!isValidAadhar(personalDetails?.aadharNumber)) {
    throw new Error("Invalid Aadhar number");
  }
};

const buildSearchFilter = (search) => {
  if (!search) {
    return {};
  }

  return {
    $or: [
      { "personalDetails.studentName": { $regex: search, $options: "i" } },
      { "personalDetails.aadharNumber": { $regex: search, $options: "i" } },
      { "contactDetails.phoneNumber": { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } }
    ]
  };
};

export const createStudent = async (req, res) => {
  const {
    personalDetails,
    academicDetails,
    contactDetails,
    facilityType,
    feeSummary
  } = req.body;

  validateStudentPayload({
    personalDetails,
    academicDetails,
    contactDetails,
    facilityType
  });

  const normalizedTransportFee =
    facilityType === "transport" ? Number(feeSummary?.transportFee || 0) : 0;
  const normalizedHostelFee =
    facilityType === "hosteler" ? Number(feeSummary?.hostelFee || 0) : 0;

  const student = await Student.create({
    personalDetails,
    academicDetails,
    contactDetails,
    facilityType,
    feeSummary: {
      admissionFee: Number(feeSummary?.admissionFee || 0),
      tuitionFee: Number(feeSummary?.tuitionFee || 0),
      transportFee: normalizedTransportFee,
      hostelFee: normalizedHostelFee,
      otherCharges: Number(feeSummary?.otherCharges || 0),
      totalAssigned:
        Number(feeSummary?.admissionFee || 0) +
        Number(feeSummary?.tuitionFee || 0) +
        normalizedTransportFee +
        normalizedHostelFee +
        Number(feeSummary?.otherCharges || 0)
    }
  });

  const currentMonth = getCurrentMonthLabel();
  const monthlyLineItems = [
    ...buildRecurringLineItemsForStudent(student, null),
    {
      feeType: "other",
      label: "Other Charges",
      amount: Number(feeSummary?.otherCharges || 0)
    }
  ].filter((item) => item.amount > 0);

  await createDueEntriesForStudent({
    student,
    monthLabel: "Admission",
    source: "manual",
    lineItems: [
      {
        feeType: "admission",
        label: "Admission Fee",
        amount: Number(feeSummary?.admissionFee || 0)
      }
    ]
  });

  await createDueEntriesForStudent({
    student,
    monthLabel: currentMonth,
    source: "manual",
    lineItems: monthlyLineItems
  });

  const refreshedStudent = await refreshStudentFeeSummary(student._id);

  res.status(201).json(refreshedStudent);
};

export const getStudents = async (req, res) => {
  const { search = "" } = req.query;

  const students = await Student.find(buildSearchFilter(search)).sort({
    createdAt: -1
  });

  res.json(students);
};

export const getStudentById = async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const feeHistory = await Fee.find({ studentId: student._id }).sort({
    paymentDate: -1
  });

  res.json({ student, feeHistory });
};

export const updateStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const previousAssigned = student.feeSummary.totalAssigned;
  const previousBaseFees =
    student.feeSummary.admissionFee +
    student.feeSummary.tuitionFee +
    student.feeSummary.transportFee +
    student.feeSummary.hostelFee +
    student.feeSummary.otherCharges;

  Object.assign(student.personalDetails, req.body.personalDetails || {});
  Object.assign(student.academicDetails, req.body.academicDetails || {});
  Object.assign(student.contactDetails, req.body.contactDetails || {});
  student.facilityType = req.body.facilityType || student.facilityType;

  validateStudentPayload({
    personalDetails: student.personalDetails,
    academicDetails: student.academicDetails,
    contactDetails: student.contactDetails,
    facilityType: student.facilityType
  });

  if (req.body.feeSummary) {
    student.feeSummary.admissionFee = Number(
      req.body.feeSummary.admissionFee ?? student.feeSummary.admissionFee
    );
    student.feeSummary.tuitionFee = Number(
      req.body.feeSummary.tuitionFee ?? student.feeSummary.tuitionFee
    );
    student.feeSummary.transportFee = Number(
      req.body.feeSummary.transportFee ?? student.feeSummary.transportFee
    );
    student.feeSummary.hostelFee = Number(
      req.body.feeSummary.hostelFee ?? student.feeSummary.hostelFee
    );
    student.feeSummary.otherCharges = Number(
      req.body.feeSummary.otherCharges ?? student.feeSummary.otherCharges
    );

    if (student.facilityType !== "transport") {
      student.feeSummary.transportFee = 0;
    }

    if (student.facilityType !== "hosteler") {
      student.feeSummary.hostelFee = 0;
    }

    const newBaseFees =
      student.feeSummary.admissionFee +
      student.feeSummary.tuitionFee +
      student.feeSummary.transportFee +
      student.feeSummary.hostelFee +
      student.feeSummary.otherCharges;

    student.feeSummary.totalAssigned = previousAssigned - previousBaseFees + newBaseFees;
  }

  await student.save();

  res.json(student);
};

export const deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  if (student.feeSummary.totalDue > 0) {
    res.status(400);
    throw new Error("Student cannot be deleted while dues are pending");
  }

  await Fee.deleteMany({ studentId: student._id });
  await student.deleteOne();

  res.json({ message: "Student deleted successfully" });
};

export const manualClassUpgrade = async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  student.academicDetails.className = req.body.className;
  student.academicDetails.section =
    req.body.section || student.academicDetails.section;
  student.lastPromotionYear = new Date().getFullYear();

  await student.save();

  res.json(student);
};

export const autoUpgradeStudents = async (_req, res) => {
  const currentYear = new Date().getFullYear();
  const students = await Student.find({
    lastPromotionYear: { $lt: currentYear }
  });

  const upgradedStudents = [];

  for (const student of students) {
    const nextClass = getNextClass(student.academicDetails.className);

    if (nextClass !== student.academicDetails.className) {
      student.academicDetails.className = nextClass;
      student.lastPromotionYear = currentYear;
      await student.save();
      upgradedStudents.push(student);
    }
  }

  res.json({
    message: "Automatic class upgrade completed",
    upgradedCount: upgradedStudents.length,
    upgradedStudents
  });
};
