import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String,default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  avatar: { type: String, default: "" },
  phoneNumber: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["Doctor", "patient"],
    default: "patient",
  },
  googleId: { type: String, default: "" , unique: true, sparse: true},
  isLoggedIn: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  certification: { type: String, default: "" },
  fee: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  specialization: { type: String, default: "" },
});

export default mongoose.model("GoogleUser", userSchema);
