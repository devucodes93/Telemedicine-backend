import http from "http";
import express from "express";
import { Server } from "socket.io";
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Doctor and patient join logic
import Booking from "../models/Booking.js";
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
    console.log(`[doctor-join-room] Doctor ${doctorId} joined room ${roomId}`);
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
      socket.emit("join-error", {
        message: "Doctor not in room yet. Please wait for doctor to join.",
      });
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
