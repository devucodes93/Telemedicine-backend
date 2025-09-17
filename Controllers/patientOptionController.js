import express from "express";
import PatientOption from "../models/PatientOption.js";

export const patientOptionController = async (req, res) => {
  try {
    console.log("Patient Option", req.body);
    const { patientId, doctorId, latitude, longitude, option, emergencyCode } =
      req.body;
    if (!patientId || !latitude || !longitude || !option) {
      return res.json({ msg: "All fields are Required", success: false });
    }
    // Build payload, only include doctorId if present and valid
    const payload = { patientId, latitude, longitude, option, emergencyCode };
    if (doctorId && typeof doctorId === "string" && doctorId.length === 24) {
      payload.doctorId = doctorId;
    }
    const emergency = new PatientOption(payload);
    await emergency.save();
    res
      .status(201)
      .json({ msg: "Patient Location is Submitted", emergency, success: true });
  } catch (error) {
    console.log("Patient Error", error);
    res.status(500).json({ msg: "Server error", error });
  }
};
