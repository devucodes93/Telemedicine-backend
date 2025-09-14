// routes/doctor.js
import express from "express";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

const router = express.Router();

// Update doctor profile
router.post("/update", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required to update profile." });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    res.json({ message: "Profile updated successfully.", doctor });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// List all doctors
router.get("/list", async (req, res) => {
  try {
    const doctors = await User.find({ role: "Doctor" });
    res.json({ doctors });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch doctors", error: err.message });
  }
});

export default router;
