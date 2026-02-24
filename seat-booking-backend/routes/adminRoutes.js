const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/holiday", adminController.addHoliday);
router.get("/holidays", adminController.getHolidays);
router.delete("/holiday/:id", adminController.deleteHoliday);

module.exports = router;