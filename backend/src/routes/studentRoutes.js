import express from "express";
import {
  autoUpgradeStudents,
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  manualClassUpgrade,
  updateStudent
} from "../controllers/studentController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(ensureAuthenticated);
router.route("/").get(asyncHandler(getStudents)).post(asyncHandler(createStudent));
router.post("/auto-upgrade", asyncHandler(autoUpgradeStudents));
router
  .route("/:id")
  .get(asyncHandler(getStudentById))
  .put(asyncHandler(updateStudent))
  .delete(asyncHandler(deleteStudent));
router.patch("/:id/upgrade", asyncHandler(manualClassUpgrade));

export default router;
