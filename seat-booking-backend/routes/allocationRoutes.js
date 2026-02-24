const express = require("express");
const router = express.Router();
const allocationController = require("../controllers/allocationController");

router.post("/allocate", allocationController.allocateSeats);
router.get("/", allocationController.getAllocations);
router.get("/squad/:squadId", allocationController.getAllocationForSquad);

module.exports = router;
