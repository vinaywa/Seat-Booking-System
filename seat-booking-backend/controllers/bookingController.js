const Booking = require("../models/Booking");
const Seat = require("../models/Seat");
const Holiday = require("../models/Holiday");
const User = require("../models/User");
const { isWeekend, isAfter3PM, isUserAllowed, getNextWorkingDay } = require("../utils/dateUtils");

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const isHoliday = async (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const holiday = await Holiday.findOne({ date: { $gte: start, $lt: end } });
  return !!holiday;
};

const getAvailableSeat = async (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const bookings = await Booking.find({
    date: { $gte: start, $lt: end },
    status: { $in: ["BOOKED", "BLOCKED"] }
  });
  const bookedSeatIds = bookings.map((b) => b.seatId.toString());

  const seat = await Seat.findOne({ _id: { $nin: bookedSeatIds } });
  return seat;
};

// ──────────────────────────────────────────────
// 1️⃣  BOOK SEAT
// ──────────────────────────────────────────────
exports.bookSeat = async (req, res) => {
  try {
    const { userId, date } = req.body;
    if (!userId || !date)
      return res.status(400).json({ message: "userId and date are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isWeekend(date))
      return res.status(400).json({ message: "Weekend booking not allowed" });

    if (await isHoliday(date))
      return res.status(400).json({ message: "Holiday booking not allowed" });

    if (!isUserAllowed(user.batch, date))
      return res.status(400).json({ message: "Not your batch day" });

    const existing = await Booking.findOne({
      userId,
      date: {
        $gte: new Date(new Date(date).setUTCHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setUTCHours(24, 0, 0, 0))
      },
      status: { $in: ["BOOKED", "BLOCKED"] }
    });
    if (existing)
      return res.status(400).json({ message: "Already booked for this date" });

    const seat = await getAvailableSeat(date);
    if (!seat) return res.status(400).json({ message: "All seats are full" });

    const booking = await Booking.create({
      userId,
      seatId: seat._id,
      date: new Date(date),
      status: "BOOKED"
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// 2️⃣  BLOCK SEAT (after 3PM, next working day)
// ──────────────────────────────────────────────
exports.blockSeat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "userId is required" });

    if (!isAfter3PM())
      return res.status(400).json({ message: "Blocking is only allowed after 3PM" });

    // Find the next working day from today
    const nextDay = getNextWorkingDay(new Date());

    // Check if next working day is a holiday — keep skipping until a non-holiday working day
    let targetDate = nextDay;
    let maxAttempts = 10;
    while ((await isHoliday(targetDate)) && maxAttempts-- > 0) {
      targetDate = getNextWorkingDay(targetDate);
    }

    if (await isHoliday(targetDate))
      return res.status(400).json({ message: "No working day available to block" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!isUserAllowed(user.batch, targetDate))
      return res.status(400).json({ message: "Next working day is not your batch day" });

    // Prevent duplicate block
    const start = new Date(targetDate); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);

    const existing = await Booking.findOne({
      userId,
      date: { $gte: start, $lt: end },
      status: { $in: ["BOOKED", "BLOCKED"] }
    });
    if (existing)
      return res.status(400).json({ message: "Already blocked/booked for that day" });

    const seat = await getAvailableSeat(targetDate);
    if (!seat) return res.status(400).json({ message: "All seats full for that day" });

    const booking = await Booking.create({
      userId,
      seatId: seat._id,
      date: targetDate,
      status: "BLOCKED"
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// 3️⃣  VACATE SEAT (on leave)
// ──────────────────────────────────────────────
exports.vacateSeat = async (req, res) => {
  try {
    const { userId, date } = req.body;
    if (!userId || !date)
      return res.status(400).json({ message: "userId and date are required" });

    const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);

    const booking = await Booking.findOneAndUpdate(
      { userId, date: { $gte: start, $lt: end }, status: { $in: ["BOOKED", "BLOCKED"] } },
      { status: "VACATED" },
      { new: true }
    );

    if (!booking)
      return res.status(404).json({ message: "No active booking found for that date" });

    res.json({ message: "Seat vacated successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// 4️⃣  GET AVAILABLE SEATS
// ──────────────────────────────────────────────
exports.getAvailableSeats = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query param required" });

    const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);

    const bookings = await Booking.find({
      date: { $gte: start, $lt: end },
      status: { $in: ["BOOKED", "BLOCKED"] }
    });
    const bookedSeatIds = bookings.map((b) => b.seatId.toString());

    const seats = await Seat.find({ _id: { $nin: bookedSeatIds } });
    res.json({ available: seats.length, total: await Seat.countDocuments(), seats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// 5️⃣  GET USER BOOKINGS
// ──────────────────────────────────────────────
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId })
      .populate("seatId")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// 6️⃣  DAILY UTILIZATION
// ──────────────────────────────────────────────
exports.getUtilization = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query param required" });

    const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);

    const totalSeats = await Seat.countDocuments();
    const totalBooked = await Booking.countDocuments({
      date: { $gte: start, $lt: end },
      status: { $in: ["BOOKED", "BLOCKED"] }
    });

    res.json({
      date,
      totalBooked,
      totalSeats,
      utilization: totalSeats ? ((totalBooked / totalSeats) * 100).toFixed(2) + "%" : "0%"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// 7️⃣  GET ALL BOOKINGS FOR A DATE
// ──────────────────────────────────────────────
exports.getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query param required" });

    const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);

    const bookings = await Booking.find({ date: { $gte: start, $lt: end } })
      .populate("userId", "name email batch")
      .populate("seatId", "seatNumber type");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};