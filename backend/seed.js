require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Seat = require('./models/Seat');
const Holiday = require('./models/Holiday');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Seat.deleteMany({});
    await User.deleteMany({});
    await Holiday.deleteMany({});
    console.log('🗑️  Cleared existing seats, users, and holidays');

    // Create 50 seats: 1–40 designated, 41–50 floater
    const seats = [];
    for (let i = 1; i <= 50; i++) {
        seats.push({ seatNumber: i, type: i <= 40 ? 'designated' : 'floater' });
    }
    await Seat.insertMany(seats);
    console.log('💺 Created 50 seats (40 designated + 10 floater)');

    // Create sample users
 const users = [
    { name: 'Super Admin', email: 'admin@example.com', password: 'SecureAdmin@2026', batch: 'A', role: 'ADMIN' },
    { name: 'Rahul Mehta', email: 'alice@example.com', password: 'Rahul@1234', batch: 'A' },
    { name: 'Sneha Kapoor', email: 'bob@example.com', password: 'Sneha@5678', batch: 'B' },
    { name: 'Arjun Verma', email: 'carol@example.com', password: 'Arjun@9012', batch: 'A' },
];
    for (const u of users) {
        const user = new User(u);
        await user.save(); // triggers bcrypt pre-save hook
    }
    console.log('👤 Created 4 sample users (admin, rahul, sneha, arjun)');

    // Sample holidays  
const holidays = [
    { date: '2026-01-01', reason: 'New Year\'s Day' },
    { date: '2026-01-26', reason: 'Republic Day' },
    { date: '2026-03-08', reason: 'Maha Shivratri' },
    { date: '2026-08-19', reason: 'Raksha Bandhan' },
    { date: '2026-11-01', reason: 'Diwali' },
];
    await Holiday.insertMany(holidays);
    console.log('🎉 Created sample holidays');

    console.log('\n✅ Seed complete! Sample credentials:');
 

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
