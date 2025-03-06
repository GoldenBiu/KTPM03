const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key'; // Thay bằng chuỗi mạnh hơn hoặc dùng dotenv

// Tạo token
const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Kiểm tra token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null; // Token không hợp lệ hoặc hết hạn
    }
};

module.exports = { generateToken, verifyToken, JWT_SECRET };