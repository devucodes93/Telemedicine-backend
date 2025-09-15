import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      default: "",
    },
    reservedTime: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: null, // null, 'accepted', 'cancelled'
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    VideoUrl: {
      type: String,
      default: "",
    },
    fee: {
      type: Number,
      default: 0,
    },
    doctorCameOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
