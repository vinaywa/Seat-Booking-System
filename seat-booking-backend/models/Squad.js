const mongoose = require("mongoose");

const squadSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  batch: { type: String, enum: ["BATCH_1", "BATCH_2"], required: true }
});

module.exports = mongoose.model("Squad", squadSchema);
