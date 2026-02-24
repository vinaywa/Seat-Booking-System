const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  squadId: { type: mongoose.Schema.Types.ObjectId, ref: "Squad" },
  batch: { type: String, enum: ["BATCH_1", "BATCH_2"] },
  role: { type: String, enum: ["EMPLOYEE", "ADMIN"], default: "EMPLOYEE" }
});

module.exports = mongoose.model("User", userSchema);