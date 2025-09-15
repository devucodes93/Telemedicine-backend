import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import dotenv from "dotenv";
import { loginEmail, sendEmail } from "../seed.js";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECREATE_KEY,
});

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, password, phoneNumber, role, avatar } = req.body;

    if (!username || !email || !phoneNumber || !password)
      return res.json({ msg: "All fields are Required", success: false });

    // check file exists
    if (!req.file) {
      return res.json({ msg: "Image file is required", success: false });
    }

    // multer gives you this
    const filePath = req.file.path; // path on disk
    const originalName = req.file.originalname;

    //   Upload Cloudinary
    const cloudinaryRes = await cloudinary.uploader.upload(req.file.path, {
      folder: "Image_Uploader",
    });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "User already exists", success: false });

    const hashedPassword = await bcrypt.hash(password, 10);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phoneNumber.trim();
    const cleanRole = role ? role.trim() : "patient";
    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      phoneNumber: cleanPhone,
      role: cleanRole, // now "doctor" without newline
      avatar: cloudinaryRes.secure_url,
    });
    await newUser.save();

    res.status(201).json({
      msg: "User created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
        avatar: newUser.avatar,
      },
      token: generateToken(newUser._id, newUser.role),
      success: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "Invalid Email or Password", success: false });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ msg: "Invalid Email or Password", success: false });
  
    const mail = loginEmail(user);
    await sendEmail({ to: user.email, subject: mail.subject, text: mail.text });

    res.status(200).json({
      msg: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatar: user.avatar,
      },
      token: generateToken(user._id, user.role),
      success: true,
    });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err.message });
  }
};
