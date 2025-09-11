import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { isAuthenticated } from "../middelware/isAutheticated.js";
import User from "../models/User.js";

const router = express.Router();

// step1: Redirect to google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    } catch (error) {
      console.error("Google Login error", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
  }
);

router.get("/me", isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar || null,
    },
  });
});

router.post("/logout", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isLoggedIn: false, isVerified: false },
      { new: true }
    );

    res.json({
      success: true,
      message: "Logged out successfully",
      user,
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
