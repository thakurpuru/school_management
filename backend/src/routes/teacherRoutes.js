import express from "express";
import {
  createTeacher,
  deleteTeacher,
  getTeachers,
  updateTeacher
} from "../controllers/teacherController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(ensureAuthenticated);
router.route("/").get(asyncHandler(getTeachers)).post(asyncHandler(createTeacher));
router
  .route("/:id")
  .put(asyncHandler(updateTeacher))
  .delete(asyncHandler(deleteTeacher));

export default router;
