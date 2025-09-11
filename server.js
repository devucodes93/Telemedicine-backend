import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "./config/passport.js";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import googleRoute from "./routes/authRoute.js";
import passport from "passport";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/auth", googleRoute);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));
