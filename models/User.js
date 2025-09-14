import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  avatar: { type: String, default: "" },
  phoneNumber: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["Doctor", "patient"],
    default: "patient",
  },
  googleId: { type: String },
  isLoggedIn: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
});

export default mongoose.model("GoogleUser", userSchema);
