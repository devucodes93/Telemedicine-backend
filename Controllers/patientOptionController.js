import express from "express";
import PatientOption from "../models/PatientOption.js";

export const patientOptionController = async (req, res) => {
  try {
    console.log("Patient Option", req.body);
    const { patientId, doctorId, latitude, longitude, option } = req.body;
    if(!patientId || !doctorId || !latitude||!longitude||!option){
        return res.json({ msg: "All fields are Required", success: false });
    }
    const emergency = new PatientOption(req.body);
    await emergency.save();
    res
      .status(201)
      .json({ msg: "Patient Location is Submitted", emergency, success: true });
  } catch (error) {
    console.log("Patient Error", error);
  }
};
