import express from "express";
import Patient from "../models/Patient.js";
const router = express.Router();

// Update patient profile
router.post("/update", async (req, res) => {
  console.log("came");
  try {
    const { email } = req.body;
    console.log(email);
    if (!email)
      return res
        .status(400)
        .json({ message: "Email is required to update profile." });
    const example = await Patient.findOneAndUpdate({ email });
    

    const patient = await Patient.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true }
    );
    console.log(patient);
    if (!patient)
      console.log('not found');
      return res.status(404).json({ message: "Patient not found." });
    res.json({ message: "Profile updated successfully.", patient });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

export default router;
