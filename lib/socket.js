import http from "http";
import express from "express";
import { Server } from "socket.io";
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Doctor and patient join logic
import Booking from "../models/Booking.js";
import User from "../models/User.js";
const joinedRooms = [];

io.on("connection", (socket) => {
  console.log("New user connected: " + socket.id);

  // Doctor joins room
  socket.on("doctor-join-room", async ({ doctorId, roomId }) => {
    console.log(
      `[doctor-join-room] DoctorId: ${doctorId}, RoomId: ${roomId}, SocketId: ${socket.id}`
    );
    joinedRooms.push({ doctorId, socketId: socket.id, roomId });
    socket.join(roomId);
    socket.emit("doctor-joined", { roomId });
    io.to(roomId).emit("connection-established", { role: "doctor", roomId });
    console.log(`[doctor-join-room] Doctor ${doctorId} joined room ${roomId}`);
  });

  socket.on("new-emergency", async (data) => {
    try {
      const patientId = data.patientId;
      const userDoc = await User.findById(patientId);

      if (!userDoc) {
        console.log("Patient not found");
        return;
      }

      // Convert to plain object so we can attach extra fields
      const user = userDoc.toObject();

      user.longitude = data.longitude;
      user.latitude = data.latitude;
      user.option = data.option;
      user.emergencyCode = data.emergencyCode;

      console.log("emergency data received", user);

      // Broadcast to all connected clients
      io.emit("emergency-alert", user);
    } catch (err) {
      console.error("Error in new-emergency socket:", err);
    }
  });

  socket.on("emergency-accepted", (data) => {
    io.emit("emergency-accepted", data);
  });
  socket.on("leave-room", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("user-left", { roomId });
    socket.leave(roomId);
  });
  // Patient joins room
  socket.on("patient-join-room", async ({ patientId, doctorId, roomId }) => {
    console.log(
      `[patient-join-room] PatientId: ${patientId}, DoctorId: ${doctorId}, RoomId: ${roomId}, SocketId: ${socket.id}`
    );
    // Check if doctor is already in joinedRooms for this room
    const doctorInRoom = joinedRooms.find(
      (entry) => entry.doctorId == doctorId && entry.roomId == roomId
    );
    if (!doctorInRoom) {
      console.log(
        `[patient-join-room] Doctor not in room yet for RoomId: ${roomId}`
      );
      socket.emit("waiting", { message: "Waiting for doctor to join..." });
      // Set a timer to retry after 5 seconds
      setTimeout(() => {
        const doctorInRoomRetry = joinedRooms.find(
          (entry) => entry.doctorId == doctorId && entry.roomId == roomId
        );
        if (!doctorInRoomRetry) {
          socket.emit("join-error", {
            message: "Doctor not in room yet. Please try again later.",
          });
        }
      }, 5000);
      return;
    }
    // Check booking DB for doctor and patient registration
    const booking = await Booking.findOne({
      doctorId,
      patientId,
      VideoUrl: `/call/${roomId}`,
      status: "accepted",
    });
    if (booking) {
      socket.join(roomId);
      socket.emit("patient-joined", { roomId });
      io.to(roomId).emit("room-ready", { roomId });
      io.to(roomId).emit("connection-established", { role: "patient", roomId });
      console.log(
        `[patient-join-room] Patient ${patientId} joined room ${roomId} (Booking accepted)`
      );
    } else {
      console.log(
        `[patient-join-room] Booking not found or not accepted for PatientId: ${patientId}, DoctorId: ${doctorId}, RoomId: ${roomId}`
      );
      socket.emit("join-error", {
        message: "Booking not found or not accepted.",
      });
    }
  });

  // Signal event for WebRTC
  socket.on("signal", (data) => {
    console.log(data, "fuck you ");
    console.log(
      `[signal] Received from SocketId: ${socket.id}, RoomID: ${data.roomId}, Data:`,
      data
    );
    socket.to(data.roomId).emit("signal", data.data);
    console.log(`[signal] Relayed to RoomID: ${data.roomId}`);
  });
});

export { io, app, server };
