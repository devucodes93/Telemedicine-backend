// routes/doctor.js
import express from "express";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import DoctorRequest from "../models/DoctorRequest.js";

const router = express.Router();

// Update doctor profile
router.post("/update", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required to update profile." });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    res.json({ message: "Profile updated successfully.", doctor });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// List all doctors
router.get("/list", async (req, res) => {
  try {
    const doctors = await User.find({ role: "Doctor" });
    res.json({ doctors });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch doctors", error: err.message });
  }
});

router.get("/isRequestAvailable", async (req, res) => {
  try {
    const doctorRequests = await DoctorRequest.findById({});
    if (!doctorRequests) {
      return res.status(404).json({ message: "Doctor Requests not found." });
    }

    res.json({ isRequestAvailable: doctorRequests });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch status", error: err.message });
  }
});
router.post("/doctor-application-response", async (req, res) => {
  try {
    const { applicationId, action } = req.body;
    if (!applicationId || !action) {
      return res
        .status(400)
        .json({ message: "Application ID and action are required." });
    }

    const application = await DoctorRequest.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    console.log(application)
    application.isApproved = action === "approve" ? "Yes" : "Rejected";
    await application.save();
    if (action === "approve") {
     const newDoctor = new Doctor({
  username: application.name,   // 👈 correct field
  email: application.email,
  password: application.password,
  phone: application.phone,
  specialization: application.specialization,
  experience: application.experience,
  fee: application.fee,
  isLoggedIn: false,
  isVerified: true,
  avatar: application.avatar,
  certification: application.certification,
  role: "Doctor",
});
// await newDoctor.save();

      
      const newUser = new User({
        userName: application.name,
        email: application.email,
        password: application.password,
        phoneNumber: application.phone,
        role: "Doctor",
        avatar: application.avatar,

        certification: application.certification,
        fee: application.fee,
        specialization: application.specialization,
        experience: application.experience,
      });

      await newUser.save();
    }

    //well remove the application from DoctorRequest collection
    await DoctorRequest.findByIdAndDelete(applicationId);

    res.json({ message: `Application ${action}d successfully.` });
  } catch (err) {
    res.status(500).json({ message: "Action failed", error: err.message });
  }
});

export default router;
