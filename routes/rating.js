const express = require('express');
const router = express.Router();
const ratingController = require('../Controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');

// Route Thêm đánh giá (yêu cầu đăng nhập)
router.post('/ratings', authMiddleware, ratingController.addRating);
// Định tuyến cho Ratings
router.get('/ratings', authMiddleware,ratingController.getRatingsByUser); // GET /ratings/trip/:tripId

module.exports = router;