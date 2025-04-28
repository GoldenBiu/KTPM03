const express = require('express');
const router = express.Router();
const bookmarkController = require('../Controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');

// Route Toggle Bookmark (yêu cầu đăng nhập)
router.post('/bookmarks', authMiddleware, bookmarkController.toggleBookmark);
router.get('/bookmarks', authMiddleware, bookmarkController.getAllBookmarks);

module.exports = router;