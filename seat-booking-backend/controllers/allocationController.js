const Allocation = require("../models/Allocation");
const Squad = require("../models/Squad");
const Seat = require("../models/Seat");
const { getWeekNumber } = require("../utils/dateUtils");

// ──────────────────────────────────────────────
// 1️⃣  TRIGGER WEEKLY ALLOCATION (Admin)
//
// Distributes seats evenly across squads for a given week.
// Each squad gets (totalSeats / totalSquads) seats, round-robin.
// ──────────────────────────────────────────────
exports.allocateSeats = async (req, res) => {
  try {
    const targetDate = req.body.date ? new Date(req.body.date) : new Date();
    const weekNumber = getWeekNumber(targetDate);
    const year = targetDate.getFullYear();

    const squads = await Squad.find();
    const seats = await Seat.find();

    if (!squads.length) return res.status(400).json({ message: "No squads found" });
    if (!seats.length) return res.status(400).json({ message: "No seats found" });

    const seatsPerSquad = Math.floor(seats.length / squads.length);
    const results = [];

    for (let i = 0; i < squads.length; i++) {
      const assignedSeats = seats.slice(i * seatsPerSquad, (i + 1) * seatsPerSquad);
      const seatIds = assignedSeats.map((s) => s._id);

      const allocation = await Allocation.findOneAndUpdate(
        { squadId: squads[i]._id, weekNumber, year },
        { seatIds },
        { upsert: true, new: true }
      );
      results.push({ squad: squads[i].name, seats: assignedSeats.map((s) => s.seatNumber), allocation });
    }

    res.json({ message: `Seats allocated for Week ${weekNumber}, Year ${year}`, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// 2️⃣  GET ALL ALLOCATIONS FOR CURRENT WEEK
// ──────────────────────────────────────────────
exports.getAllocations = async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const weekNumber = getWeekNumber(targetDate);
    const year = targetDate.getFullYear();

    const allocations = await Allocation.find({ weekNumber, year })
      .populate("squadId", "name batch")
      .populate("seatIds", "seatNumber type");

    res.json({ weekNumber, year, allocations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// 3️⃣  GET ALLOCATION FOR A SPECIFIC SQUAD
// ──────────────────────────────────────────────
exports.getAllocationForSquad = async (req, res) => {
  try {
    const { squadId } = req.params;
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const weekNumber = getWeekNumber(targetDate);
    const year = targetDate.getFullYear();

    const allocation = await Allocation.findOne({ squadId, weekNumber, year })
      .populate("squadId", "name batch")
      .populate("seatIds", "seatNumber type");

    if (!allocation)
      return res.status(404).json({ message: "No allocation found for this squad this week" });

    res.json(allocation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
