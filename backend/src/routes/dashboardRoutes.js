import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ensureAuthenticated, asyncHandler(getDashboardStats));

export default router;
