const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/book", bookingController.bookSeat);
router.post("/block", bookingController.blockSeat);
router.post("/vacate", bookingController.vacateSeat);
router.get("/available", bookingController.getAvailableSeats);
router.get("/user/:userId", bookingController.getUserBookings);
router.get("/utilization", bookingController.getUtilization);
router.get("/", bookingController.getBookingsByDate);

module.exports = router;