import express from "express";
import {
  getSalaryHistory,
  paySalary
} from "../controllers/salaryController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(ensureAuthenticated);
router.route("/").get(asyncHandler(getSalaryHistory)).post(asyncHandler(paySalary));

export default router;
