
# Smart Seat Allocation & Utilization Management System

This project is a MERN Stack–based application designed to efficiently manage and optimize office seat utilization for employees operating in rotating batches. The system ensures structured allocation, prevents booking conflicts, and provides visibility into daily seat usage.

Project Overview

The organization consists of 80 employees divided into 10 squads (8 members each), while only 50 physical seats are available (40 fixed seats and 10 floater seats). Employees operate in two alternating batches with different weekly schedules.

This system automates seat allocation based on predefined business rules, ensures fair usage, prevents double booking, and provides analytics for management decision-making.

Key Objectives

• Optimize utilization of limited seating resources
• Enforce batch-based attendance rules
• Prevent seat booking on weekends and holidays
• Enable controlled seat blocking after 3 PM
• Allow employees to vacate seats when on leave
• Provide real-time seat utilization tracking

System Architecture

Frontend: React.js
Backend: Node.js with Express
Database: MongoDB

The application follows a REST-based architecture where the frontend communicates with the backend via API endpoints, and the backend manages business logic and data persistence using MongoDB.

User → React Interface → Express REST API → MongoDB

Project Structure

seat-booking-backend/

server.js – Application entry point
seedSeats.js – Script to generate initial seat data

config/
db.js – MongoDB connection configuration

models/
User.js – Employee schema
Seat.js – Seat schema
Booking.js – Booking schema
Holiday.js – Holiday schema
Squad.js – Squad schema

controllers/
bookingController.js – Seat booking logic
adminController.js – Administrative operations

routes/
bookingRoutes.js – Booking-related API endpoints
adminRoutes.js – Admin-related API endpoints

utils/
dateUtils.js – Helper functions for date validation, batch logic, and time-based rules

Database Design

Users Collection
Stores employee information including batch assignment and squad mapping.

Seats Collection
Contains 50 seat records classified as FIXED or FLOATER.

Bookings Collection
Maintains daily seat reservations with status values:
• BOOKED
• BLOCKED
• VACATED

A unique compound index on (seatId, date) ensures that a seat cannot be double-booked on the same day.

Holidays Collection
Stores organization-defined holidays to restrict booking on specific dates.

Core Functionalities

Weekly Batch-Based Allocation
The system validates employee batch schedules dynamically based on the week number and assigned working days.

Seat Blocking Rule
Employees are allowed to block seats only after 3 PM for the next valid working day.

Leave-Based Seat Vacating
Users can vacate previously booked seats, making them immediately available for others.

Holiday and Weekend Restriction
The system prevents booking on Saturdays, Sundays, and administrator-defined holidays.

Seat Allocation Strategy
The system validates working day rules, checks eligibility, verifies availability, and assigns the first available seat while preventing conflicts.

Utilization Tracking
Daily seat utilization is calculated as:

Utilization (%) = (Booked Seats / 50) × 100

This metric enables management to analyze occupancy efficiency.

API Endpoints

Booking APIs
POST /api/bookings/book
POST /api/bookings/block
POST /api/bookings/vacate
GET /api/bookings/available?date=YYYY-MM-DD
GET /api/bookings/user/:userId
GET /api/bookings/utilization?date=YYYY-MM-DD

Admin APIs
POST /api/admin/holiday
GET /api/admin/holidays
DELETE /api/admin/holiday/:id

Technical Considerations

• Business rule validation at the controller layer
• Unique indexing to prevent duplicate seat allocation
• Status-based booking state management
• Date validation for weekend and holiday enforcement
• Modular folder structure for scalability and maintainability

Future Enhancements

• JWT-based authentication and role-based authorization
• Real-time updates using WebSockets (Socket.io)
• Dashboard analytics for management
• Floor heatmap visualization
• Concurrency-safe booking using database transactions
• Deployment-ready configuration for cloud hosting

Conclusion

This system demonstrates structured backend architecture, rule-based allocation logic, database consistency management, and real-time utilization analytics. It reflects strong system design principles and scalable MERN stack implementation practices.