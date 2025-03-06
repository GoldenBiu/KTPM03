const { verifyToken } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
    // Lấy token từ header Authorization
    const token = req.headers['authorization']?.split(' ')[1]; // Giả sử gửi dạng "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Lưu thông tin người dùng vào req để sử dụng trong controller
    req.user = decoded; // Chứa user_id và email
    next(); // Chuyển tiếp nếu token hợp lệ
};

module.exports = authMiddleware;