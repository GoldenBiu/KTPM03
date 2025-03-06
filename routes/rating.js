const express = require('express');
const router = express.Router();
const ratingController = require('../Controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');

// Route Thêm đánh giá (yêu cầu đăng nhập)
router.post('/ratings', authMiddleware, ratingController.addRating);

module.exports = router;