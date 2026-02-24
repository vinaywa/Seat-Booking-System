const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  date: Date,
  description: String
});

module.exports = mongoose.model("Holiday", holidaySchema);