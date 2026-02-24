const express = require("express");
const router = express.Router();
const squadController = require("../controllers/squadController");

router.post("/", squadController.createSquad);
router.get("/", squadController.getSquads);
router.get("/:id", squadController.getSquad);

module.exports = router;
