import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { doctorApply, login, register } from "../Controllers/authController.js";
import multer from "multer";
const storage = multer.diskStorage({});
const upload = multer({ storage });

const router = express.Router();
router.post("/doctor-apply", doctorApply);
// Signup
router.post("/signup", upload.single("avatar"), register);
// Admin: fetch all doctor applications
router.get("/admin/doctor-requests", async (req, res) => {
  // Simple hardcoded admin auth
  const { email, password } = req.query;
  if (email !== "devu935352@gmail.com" || password !== "123456") {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  try {
    const requests = await (
      await import("../models/DoctorRequest.js")
    ).default.find();
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Login
router.post("/login", login);

router.get("/doctor-applications", async (req, res) => {
  try {
    const requests = await (
      await import("../models/DoctorRequest.js")
    ).default.find();
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
