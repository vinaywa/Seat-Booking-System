const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  seatId: { type: mongoose.Schema.Types.ObjectId, ref: "Seat" },
  date: Date,
  status: { 
    type: String, 
    enum: ["BOOKED", "BLOCKED", "VACATED"], 
    default: "BOOKED" 
  }
}, { timestamps: true });

bookingSchema.index({ seatId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);