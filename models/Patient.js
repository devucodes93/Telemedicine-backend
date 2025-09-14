import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "" },
    email: { type: String, required: true, unique: true, default: "" },
    password: { type: String, required: true, default: "" },
    phone: { type: String, required: true, default: "" },
    age: { type: Number, required: true, default: 0 },
    gender: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
