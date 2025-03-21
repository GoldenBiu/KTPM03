const express = require("express");
const router = express.Router();
const { getact ,addActivity} = require("../Controllers/activitiesController"); // Import controller
const authMiddleware = require('../middleware/authMiddleware');

// const activitiesController = require('../Controllers/activitiesController');
// const connection = require("../db"); // Import kết nối MySQL
router.get("/activities/:destination_id",authMiddleware, getact)
router.post("/activities",authMiddleware, addActivity);
// router.get("/:destination_id", activitiesController.getact);
module.exports = router;
