import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String },
  email:    { type: String, required: true, unique: true },
  googleId: { type: String },
  password: { type: String },
  avatar: { type: String },
  isLoggedIn:{type: Boolean,default:false},
  isVerified:{type: Boolean,default:false}
});

export default mongoose.model("GoogleUser", userSchema);
