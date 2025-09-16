import express from "express";
import { patientOptionController } from "../Controllers/patientOptionController.js";

const router = express.Router();

router.post("/patient-option", patientOptionController);

export default router;
