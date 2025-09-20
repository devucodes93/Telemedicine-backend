import express from "express";
import { patientOptionController } from "../Controllers/patientOptionController.js";
import PatientOption from "../models/PatientOption.js";

const router = express.Router();

router.post("/patient-option", patientOptionController);
router.post("/emergency/response", async (req, res) => {
  try {
    const { doctorId, patientId, doctorLocation, emergencyCode } = req.body;

    // Build dynamic update object
    const updateFields = {};
    if (doctorId) updateFields.doctorId = doctorId;
    if (emergencyCode) updateFields.emergencyCode = emergencyCode;

    if (
      doctorLocation &&
      typeof doctorLocation.latitude === "number" &&
      typeof doctorLocation.longitude === "number"
    ) {
      updateFields.doctorLocation = {
        type: "Point",
        coordinates: [doctorLocation.longitude, doctorLocation.latitude], // GeoJSON format
      };
    }

    // Only update fields that exist
    const emergency = await PatientOption.findOneAndUpdate(
      { emergencyCode },
      { $set: updateFields },
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    res.json({ message: "Response recorded", emergency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.get("/emergencies", async (req, res) => {
  const code = req.query.code;
  console.log(code);

  try {
    const emergencies = await PatientOption.findOne({ emergencyCode: code });

    //find doctor and patient details
    if (!emergencies) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    const patientId = emergencies.patientId;
    const doctorId = emergencies.doctorId;
    console.log(doctorId);
    emergencies = await PatientOption.findOne({ emergencyCode: code });
    await emergencies
      .populate("patientId", "-password -__v -role")
      .populate("doctorId", "-password -__v -role");
    console.log(emergencies);

    res.json({ emergencies });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
