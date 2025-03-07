const express = require('express');
const router = express.Router();
const tagController = require('../Controllers/tagController');

// Route thêm tag
router.post('/tags', tagController.createTag);

// Route lấy danh sách tag
router.get('/tags', tagController.getAllTags);

// Route xóa tag
router.delete('/tags/:tag_id', tagController.deleteTag);

module.exports = router;