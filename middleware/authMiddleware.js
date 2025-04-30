const { verifyToken } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
    // Log toàn bộ header để kiểm tra
    

    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];

    // Xử lý token linh hoạt hơn
    let token;
    if (authHeader) {
        // Thử các cách khác nhau để lấy token
        token = authHeader.includes('Bearer ') 
            ? authHeader.split(' ')[1]  // Nếu có "Bearer "
            : authHeader;  // Nếu không có "Bearer "
    }


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
        });
    }

    // Log thông tin giải mã
    // Lưu thông tin người dùng vào req để sử dụng trong controller
    req.user = decoded; // Chứa user_id và email
    next(); // Chuyển tiếp nếu token hợp lệ
};

module.exports = authMiddleware;