const express = require('express');
const router = express.Router();
const destinationsController = require('../Controllers/destinationsController'); 
const authMiddleware = require('../middleware/authMiddleware');

// Định tuyến cho Destinations
router.post('/',authMiddleware, destinationsController.createDestination); // POST /destinations
router.get('/:trip_id',authMiddleware, destinationsController.getDestination);  // GET /destinations/:id

module.exports = router;