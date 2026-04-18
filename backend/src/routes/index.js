import express from "express";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import feeRoutes from "./feeRoutes.js";
import salaryRoutes from "./salaryRoutes.js";
import staffRoutes from "./staffRoutes.js";
import studentRoutes from "./studentRoutes.js";
import teacherRoutes from "./teacherRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/students", studentRoutes);
router.use("/fees", feeRoutes);
router.use("/teachers", teacherRoutes);
router.use("/staff", staffRoutes);
router.use("/salaries", salaryRoutes);

export default router;
