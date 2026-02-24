const Squad = require("../models/Squad");
const User = require("../models/User");

// 1️⃣ CREATE SQUAD
exports.createSquad = async (req, res) => {
  try {
    const { name, batch } = req.body;
    if (!name || !batch)
      return res.status(400).json({ message: "name and batch are required" });
    const squad = await Squad.create({ name, batch });
    res.status(201).json(squad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ GET ALL SQUADS WITH MEMBERS
exports.getSquads = async (req, res) => {
  try {
    const squads = await Squad.find().sort({ name: 1 });
    const squadsWithMembers = await Promise.all(
      squads.map(async (squad) => {
        const members = await User.find({ squadId: squad._id }, "name email batch role");
        return { ...squad.toObject(), members };
      })
    );
    res.json(squadsWithMembers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ GET SINGLE SQUAD
exports.getSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);
    if (!squad) return res.status(404).json({ message: "Squad not found" });
    const members = await User.find({ squadId: squad._id }, "name email batch role");
    res.json({ ...squad.toObject(), members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
