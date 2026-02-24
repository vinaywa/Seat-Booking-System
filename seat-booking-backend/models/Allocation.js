const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  squadId: { type: mongoose.Schema.Types.ObjectId, ref: "Squad", required: true },
  seatIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seat" }],
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true }
}, { timestamps: true });

allocationSchema.index({ squadId: 1, weekNumber: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Allocation", allocationSchema);
