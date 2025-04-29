const { verifyToken } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
    // Log toàn bộ header để kiểm tra
    console.log('Full Request Headers:', req.headers);

    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);

    // Xử lý token linh hoạt hơn
    let token;
    if (authHeader) {
        // Thử các cách khác nhau để lấy token
        token = authHeader.includes('Bearer ') 
            ? authHeader.split(' ')[1]  // Nếu có "Bearer "
            : authHeader;  // Nếu không có "Bearer "
    }

    console.log('Extracted Token:', token);

    if (!token) {
        return res.status(401).json({ 
            message: 'Không có token, vui lòng đăng nhập',
            headers: req.headers
        });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ 
            message: 'Token không hợp lệ hoặc đã hết hạn',
            token: token
        });
    }

    // Log thông tin giải mã
    console.log('Decoded Token:', decoded);

    // Lưu thông tin người dùng vào req để sử dụng trong controller
    req.user = decoded; // Chứa user_id và email
    next(); // Chuyển tiếp nếu token hợp lệ
};

module.exports = authMiddleware;