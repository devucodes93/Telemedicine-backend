// GET /booking/all?patientId=... - fetch all bookings for a patient

import express from "express";
import Booking from "../models/Booking.js";
import mongoose from "mongoose";

const router = express.Router();
router.get("/all", async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) {
      return res.status(400).json({ msg: "Missing patientId" });
    }
    // Auto-delete cancelled bookings older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await Booking.deleteMany({
      status: "cancelled",
      updatedAt: { $lt: oneHourAgo },
    });

    const bookings = await Booking.find({ patientId });
    res.json({ bookings });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching bookings", error: err.message });
  }
});
// POST /booking - create a new booking
router.post("/booking", async (req, res) => {
  try {
    const { patientId, doctorId, date } = req.body;
    if (!patientId || !doctorId || !date) {
      return res.status(400).json({ msg: "Missing required fields" });
    }
    const booking = new Booking({
      patientId,
      doctorId,
      date,
      time: "",
      reservedTime: null,
    });
    await booking.save();
    res.status(201).json({ msg: "Booking successful", booking });
  } catch (err) {
    res.status(500).json({ msg: "Booking failed", error: err.message });
  }
});

// GET /booking?patientId=... - check if patient has a booking
router.get("/booking", async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) {
      return res.status(400).json({ msg: "Missing patientId" });
    }
    // Auto-delete cancelled bookings older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await Booking.deleteMany({
      status: "cancelled",
      updatedAt: { $lt: oneHourAgo },
    });

    const booking = await Booking.findOne({ patientId });
    if (booking) {
      // Fetch doctor and patient details from GoogleUser collection
      const User = (await import("../models/User.js")).default;
      const doctor = await User.findById(booking.doctorId);
      const patient = await User.findById(booking.patientId);
      // Merge booking, doctor, and patient details into a single flat object
      const response = {
        booked: true,
        bookingId: booking._id,
        patientId: booking.patientId,
        patientInfo: patient
          ? {
              username: patient.username,
              email: patient.email,
              avatar: patient.avatar,
              phoneNumber: patient.phoneNumber,
              role: patient.role,
              googleId: patient.googleId,
              isLoggedIn: patient.isLoggedIn,
              isVerified: patient.isVerified,
            }
          : null,
        doctorId: booking.doctorId,
        fee: booking.fee,
        doctorCameOnline: booking.doctorCameOnline,
        date: booking.date,
        status: booking.status,
        time: booking.time,
        reservedTime: booking.reservedTime,
        isCompleted: booking.isCompleted,
        VideoUrl: booking.VideoUrl,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        doctorName: doctor?.username,
        doctorSpecialization: doctor?.specialization,
        doctorExperience: doctor?.experience,
        doctorFee: doctor?.fee,
        doctorAvatar: doctor?.avatar,
        doctorEmail: doctor?.email,
        doctorPhone: doctor?.phoneNumber,
        doctorRole: doctor?.role,
      };
      return res.json(response);
    } else {
      return res.json({ booked: false });
    }
  } catch (err) {
    res.status(500).json({ msg: "Error checking booking", error: err.message });
  }
});
// GET /doctor?doctorId=... - fetch all appointments for a doctor
router.get("/doctor", async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) {
      return res.status(400).json({ msg: "Missing doctorId" });
    }
    const bookings = await Booking.find({ doctorId });
    // For each booking, fetch patient details from User collection
    const User = (await import("../models/User.js")).default;
    const bookingsWithPatient = await Promise.all(
      bookings.map(async (booking) => {
        const patient = await User.findById(booking.patientId);
        return {
          ...booking.toObject(),
          patientName: patient?.username,
          patientEmail: patient?.email,
          patientAvatar: patient?.avatar,
          patientPhone: patient?.phoneNumber,
        };
      })
    );
    res.json({ appointments: bookingsWithPatient });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching appointments", error: err.message });
  }
});
// POST /booking/accept/:id - accept appointment, set status, reservedTime, and VideoUrl
router.post("/accept/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { time, fee } = req.body;
    if (!time) {
      return res.status(400).json({ msg: "Missing time" });
    }
    if (fee === undefined || fee === null) {
      return res.status(400).json({ msg: "Missing fee" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }
    booking.status = "accepted";
    booking.reservedTime = time;
    booking.fee = fee;
    booking.VideoUrl = `/call/${bookingId}`;
    await booking.save();
    res.json({ msg: "Appointment accepted", booking });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error accepting appointment", error: err.message });
  }
});

// POST /booking/cancel/:id - cancel appointment, set status
router.post("/cancel/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json({ msg: "Appointment cancelled", booking });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error cancelling appointment", error: err.message });
  }
});

router.post("/doctor-live", async (req, res) => {
  try {
    const { bookingId, status, doctorId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ msg: "Missing bookingId" });
    }
    //setting wether doctor came online or not
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }
    booking.doctorCameOnline = status;
    await booking.save();
    res.json({ msg: "Doctor live status updated", booking });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error updating doctor live status", error: err.message });
  }
});

router.get("/check-online", async (req, res) => {
  try {
    const { bookingId } = req.query;
    if (!bookingId) {
      return res.status(400).json({ msg: "Missing bookingId" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }
    res.json({ doctorCameOnline: booking.doctorCameOnline });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error checking doctor online status", error: err.message });
  }
});
//

export default router;
// GET /doctor/match-count?bookingId=... - find all bookings matching doctor userId from bookingId
