const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  type: { type: String, enum: ["FIXED", "FLOATER"] }
});

module.exports = mongoose.model("Seat", seatSchema);