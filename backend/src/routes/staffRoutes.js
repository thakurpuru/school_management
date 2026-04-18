import express from "express";
import {
  createStaff,
  deleteStaff,
  getStaffMembers,
  updateStaff
} from "../controllers/staffController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(ensureAuthenticated);
router.route("/").get(asyncHandler(getStaffMembers)).post(asyncHandler(createStaff));
router
  .route("/:id")
  .put(asyncHandler(updateStaff))
  .delete(asyncHandler(deleteStaff));

export default router;
