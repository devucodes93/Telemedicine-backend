import mongoose from "mongoose";

const doctorRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "" },
    email: { type: String, required: true, unique: true, default: "" },
    password: { type: String, required: true, default: "" },
    specialization: { type: String, required: true, default: "" },
    phone: { type: String, required: true, default: "" },
    experience: { type: Number, required: true, default: 0 },
    fee: { type: Number, required: true, default: 0 },
    avatar: { type: String, default: "" },
    certification: { type: String, required: true, default: "" },
    isApproved: { type: String, default: "No" },
  },
  { timestamps: true }
);

export default mongoose.model("DoctorRequest", doctorRequestSchema);
