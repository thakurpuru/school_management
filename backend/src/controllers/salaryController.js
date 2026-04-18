import Salary from "../models/Salary.js";
import Teacher from "../models/Teacher.js";
import Staff from "../models/Staff.js";
import { createSalarySlipPdf } from "../services/pdfService.js";

const buildSlipNumber = () => `SLIP-${Date.now()}`;

const getEmployeeModel = async (employeeModel, employeeId) => {
  if (employeeModel === "Teacher") {
    return Teacher.findById(employeeId);
  }

  if (employeeModel === "Staff") {
    return Staff.findById(employeeId);
  }

  return null;
};

export const paySalary = async (req, res) => {
  const { employeeModel, employeeId, monthLabel, amount, paymentDate, note } = req.body;

  if (!employeeModel || !employeeId || !monthLabel || amount === undefined || Number(amount) <= 0) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const employee = await getEmployeeModel(employeeModel, employeeId);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const salary = await Salary.create({
    employeeId,
    employeeModel,
    slipNumber: buildSlipNumber(),
    monthLabel,
    amount,
    paymentDate: paymentDate || new Date(),
    note
  });

  const pdfPath = await createSalarySlipPdf({ employee, salary });
  salary.pdfPath = pdfPath;
  await salary.save();

  res.status(201).json({
    message: "Salary recorded successfully",
    salary
  });
};

export const getSalaryHistory = async (req, res) => {
  const query = {};

  if (req.query.employeeId) {
    query.employeeId = req.query.employeeId;
  }

  if (req.query.employeeModel) {
    query.employeeModel = req.query.employeeModel;
  }

  const salaryHistory = await Salary.find(query)
    .sort({ paymentDate: -1 })
    .populate("employeeId");

  res.json(salaryHistory);
};
