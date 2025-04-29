const express = require('express');
const router = express.Router();
const destinationsController = require('../Controllers/destinationsController'); 
const authMiddleware = require('../middleware/authMiddleware');
// Định tuyến cho Destinations
router.post('/Destinations', authMiddleware,destinationsController.createDestination); // POST /destinations
router.get('/Destinations/:id',authMiddleware, destinationsController.getDestination);  // GET /destinations/:id
router.get('/getPostsByUserId',authMiddleware, destinationsController.getPostsByUserId); // GET /destinations

module.exports = router;