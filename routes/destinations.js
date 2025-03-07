const express = require('express');
const router = express.Router();
const destinationsController = require('../Controllers/destinationsController'); 
// Định tuyến cho Destinations
router.post('/', destinationsController.createDestination); // POST /destinations
router.get('/:id', destinationsController.getDestination);  // GET /destinations/:id

module.exports = router;