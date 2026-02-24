/**
 * seed.js — Seed the database with:
 *   - 50 Seats (10 FLOATER + 40 FIXED)
 *   - 10 Squads (5 BATCH_1, 5 BATCH_2)
 *   - 80 Users (8 per squad)
 *
 * Run: node seed.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Seat = require("./models/Seat");
const Squad = require("./models/Squad");
const User = require("./models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Seat.deleteMany({});
  await Squad.deleteMany({});
  await User.deleteMany({});
  console.log("Cleared existing Seats, Squads, Users");

  // ── 50 SEATS ──────────────────────────────────
  const seats = [];
  for (let i = 1; i <= 40; i++) {
    seats.push({ seatNumber: `F${String(i).padStart(2, "0")}`, type: "FIXED" });
  }
  for (let i = 1; i <= 10; i++) {
    seats.push({ seatNumber: `FL${String(i).padStart(2, "0")}`, type: "FLOATER" });
  }
  await Seat.insertMany(seats);
  console.log(`Seeded ${seats.length} seats`);

  // ── 10 SQUADS ─────────────────────────────────
  const squadData = [
    { name: "Alpha",   batch: "BATCH_1" },
    { name: "Bravo",   batch: "BATCH_1" },
    { name: "Charlie", batch: "BATCH_1" },
    { name: "Delta",   batch: "BATCH_1" },
    { name: "Echo",    batch: "BATCH_1" },
    { name: "Foxtrot", batch: "BATCH_2" },
    { name: "Golf",    batch: "BATCH_2" },
    { name: "Hotel",   batch: "BATCH_2" },
    { name: "India",   batch: "BATCH_2" },
    { name: "Juliet",  batch: "BATCH_2" },
  ];
  const squads = await Squad.insertMany(squadData);
  console.log(`Seeded ${squads.length} squads`);

  // ── 80 USERS (8 per squad) ────────────────────
  const users = [];
  for (const squad of squads) {
    for (let j = 1; j <= 8; j++) {
      const namePart = `${squad.name}${j}`;
      users.push({
        name: `${squad.name} Member ${j}`,
        email: `${namePart.toLowerCase()}@company.com`,
        squadId: squad._id,
        batch: squad.batch,
        role: j === 1 ? "ADMIN" : "EMPLOYEE", // first member of each squad is admin
      });
    }
  }
  await User.insertMany(users);
  console.log(`Seeded ${users.length} users`);

  console.log("\n✅ Seeding complete!");
  console.log("  50 seats (40 FIXED + 10 FLOATER)");
  console.log("  10 squads (5 BATCH_1, 5 BATCH_2)");
  console.log("  80 users (8 per squad)");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
