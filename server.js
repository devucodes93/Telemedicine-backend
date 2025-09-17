import dotenv from "dotenv";
dotenv.config();

import express from "express";
import "./config/passport.js";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import googleRoute from "./routes/authRoute.js";
import patientRoutes from "./routes/patient.js";
import doctorRoutes from "./routes/doctor.js";
import bookingsRoute from "./routes/bookingsRoute.js";
import patientOption from "./routes/patientOption.js";
import passport from "passport";
import { server, app } from "./lib/socket.js";

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/auth", googleRoute);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' http://localhost:5173 'wasm-unsafe-eval' 'inline-speculation-rules' chrome-extension://20a9100a-7b1d-4459-8f51-61a8fbc3b3c1/"
  );
  next();
});

app.use("/api/booking", bookingsRoute);
app.use("/api", patientOption);
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

server.listen(5000, "0.0.0.0", () =>
  console.log("Server running on port 5000")
);
