const express = require('express');
const router = express.Router();
const likeController = require('../Controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');

// Route Toggle Like (yêu cầu đăng nhập)
router.post('/likes', authMiddleware, likeController.toggleLike);
router.get('/likes', authMiddleware, likeController.getLikedTripsByUser);

module.exports = router;