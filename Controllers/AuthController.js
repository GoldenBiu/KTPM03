const bcrypt = require('bcryptjs');
const connection = require('../config/db');
const { generateToken } = require('../config/jwt');

const authController = {
    // Đăng ký
    register: async (req, res) => {
        const { username, email, password, profile_image, bio } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp username, email và password' });
        }

        try {
            // Kiểm tra username hoặc email đã tồn tại chưa
            const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
            const [existingUsers] = await connection.query(checkQuery, [username, email]);

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Username hoặc email đã tồn tại' });
            }

            // Mã hóa mật khẩu
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Chèn dữ liệu mới
            const insertQuery = 'INSERT INTO users (username, email, password_hash, profile_image, bio) VALUES (?, ?, ?, ?, ?)';
            const [result] = await connection.query(insertQuery, [username, email, password_hash, profile_image || null, bio || null]);

            res.status(201).json({ message: 'Đăng ký thành công', user_id: result.insertId });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },
    // Đăng nhập và trả về token
    login: async (req, res) => {
        const { email, password } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và password' });
        }

        try {
            // Tìm người dùng theo email
            const query = 'SELECT * FROM users WHERE email = ?';
            const [results] = await connection.query(query, [email]);

            if (results.length === 0) {
                return res.status(401).json({ message: 'Email không tồn tại' });
            }

            const user = results[0];

            // So sánh mật khẩu
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(401).json({ message: 'Mật khẩu không đúng' });
            }

            // Tạo token
            const token = generateToken(user);

            // Trả về thông tin người dùng và token
            res.json({
                message: 'Đăng nhập thành công',
                token
            });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },
    getUserById: async (req, res) => {
        const user_id = req.user.user_id; // Lấy user_id từ token đã xác thực


        try {
            const query = `
                SELECT user_id, username, email, profile_image, bio, created_at 
                FROM users 
                WHERE user_id = ?`;
            
            const [results] = await connection.query(query, [user_id]);

            if (results.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            res.json({
                message: 'Lấy dữ liệu người dùng thành công',
                user: results[0]
            });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};




module.exports = authController;