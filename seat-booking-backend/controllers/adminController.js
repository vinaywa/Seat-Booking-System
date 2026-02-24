const Holiday = require("../models/Holiday");

// 1️⃣ ADD HOLIDAY
exports.addHoliday = async (req, res) => {
  try {
    const { date, description } = req.body;
    if (!date) return res.status(400).json({ message: "date is required" });
    const holiday = await Holiday.create({ date: new Date(date), description });
    res.status(201).json(holiday);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ GET ALL HOLIDAYS
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ DELETE HOLIDAY
exports.deleteHoliday = async (req, res) => {
  try {
    const deleted = await Holiday.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Holiday not found" });
    res.json({ message: "Holiday deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};