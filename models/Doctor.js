import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "" },
    email: { type: String, required: true, unique: true, default: "" },
    password: { type: String, required: true, default: "" },
    specialization: { type: String, required: true, default: "" },
    phone: { type: String, required: true, default: "" },
    experience: { type: Number, required: true, default: 0 },
    fee: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
