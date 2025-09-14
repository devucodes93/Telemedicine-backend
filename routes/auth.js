import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { login, register } from "../Controllers/authController.js";
import multer from "multer";
const storage = multer.diskStorage({});
const upload = multer({ storage });

const router = express.Router();

// Signup
router.post("/signup", upload.single("avatar"), register);

// Login
router.post("/login", login);

export default router;
