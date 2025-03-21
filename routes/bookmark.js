const express = require('express');
const router = express.Router();
const bookmarkController = require('../Controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');
const { getBookmarks } = require("../Controllers/bookmarkController");

// Route Toggle Bookmark (yêu cầu đăng nhập)
router.post('/bookmarks', authMiddleware, bookmarkController.toggleBookmark);

// Route GET danh sách bookmark
router.get("/bookmarks",  authMiddleware, bookmarkController.getBookmarks);

module.exports = router;