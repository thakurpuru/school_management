import express from "express";
import {
  generateDueReport,
  generateMonthlyDues,
  getFeeStructure,
  getFeeHistoryForStudent,
  saveFeeStructure,
  getStudentFeeOverview,
  payStudentFee
} from "../controllers/feeController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(ensureAuthenticated);
router.get("/structure", asyncHandler(getFeeStructure));
router.post("/structure", asyncHandler(saveFeeStructure));
router.post("/monthly-dues", asyncHandler(generateMonthlyDues));
router.get("/due-report", asyncHandler(generateDueReport));
router.get("/:studentId/overview", asyncHandler(getStudentFeeOverview));
router.get("/:studentId/history", asyncHandler(getFeeHistoryForStudent));
router.post("/:studentId/pay", asyncHandler(payStudentFee));

export default router;
