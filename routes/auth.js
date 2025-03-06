const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');

// Route Đăng ký
router.post('/register', authController.register);

// Route Đăng nhập
router.post('/login', authController.login);

// Route Lấy dữ liệu người dùng theo user_id
router.get('/users/:user_id', authController.getUserById);

module.exports = router;