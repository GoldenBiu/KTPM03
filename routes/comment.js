const express = require('express');
const router = express.Router();
const commentController = require('../Controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/comments', authMiddleware, commentController.addComment);


router.get('/comments/trip/:trip_id', commentController.getCommentsByTripId);


module.exports = router;