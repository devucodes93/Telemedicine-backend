import mongoose from "mongoose";

const PatientOptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    latitude: { type: Number },
    longitude: { type: Number },
    option: {
      type: String,
      enum: [
        "Critical Conditions",
        "Urgent Conditions",
        "General Health Conditions",
      ],
      default: "General Health Conditions",
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmergencyDetail", PatientOptionSchema);
