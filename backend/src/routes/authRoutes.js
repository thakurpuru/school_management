import express from "express";
import passport from "passport";
import {
  getCurrentAdmin,
  login,
  logout
} from "../controllers/authController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || "Login failed" });
    }

    req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return login(req, res);
    });
  })(req, res, next);
});

router.post("/logout", ensureAuthenticated, logout);
router.get("/me", getCurrentAdmin);

export default router;
