const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');

// Route Đăng ký
router.post('/register', authController.register);

// Route Đăng nhập
router.post('/login', authController.login);

// Route Lấy dữ liệu người dùng theo user_id
router.get('/users/', authMiddleware,authController.getUserById);

// Route Cập nhật thông tin người dùng
router.put('/users/:id', authMiddleware, authController.updateUser);

module.exports = router;