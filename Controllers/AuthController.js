const bcrypt = require('bcrypt');
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
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const query = 'INSERT INTO users (username, email, password_hash, profile_image, bio) VALUES (?, ?, ?, ?, ?)';
            connection.query(query, [username, email, password_hash, profile_image || null, bio || null], (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: 'Username hoặc email đã tồn tại' });
                    }
                    return res.status(500).json({ message: 'Lỗi server', error: err });
                }
                res.status(201).json({ message: 'Đăng ký thành công', user_id: result.insertId });
            });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi mã hóa mật khẩu', error });
        }
    },

    // Đăng nhập và trả về token
    login: async (req, res) => {
        const { email, password } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và password' });
        }

        // Tìm người dùng theo email
        const query = 'SELECT * FROM Users WHERE email = ?';
        connection.query(query, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Email không tồn tại' });
            }

            const user = results[0];

            // So sánh mật khẩu
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(401).json({ message: 'Mật khẩu không đúng' });
            }

            // Tạo token bằng hàm từ jwt.js
            const token = generateToken(user);

            // Trả về thông tin người dùng và token
            res.json({
                message: 'Đăng nhập thành công',
                token
            });
        });
    },
    getUserById: (req, res) => {
        const { user_id } = req.params; // Lấy user_id từ URL

        if (!user_id) {
            return res.status(400).json({ message: 'Vui lòng cung cấp user_id' });
        }

        const query = 'SELECT user_id, username, email, profile_image, bio, created_at FROM users WHERE user_id = ?';
        connection.query(query, [user_id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            res.json({
                message: 'Lấy dữ liệu người dùng thành công',
                user: results[0]
            });
        });
    }
};




module.exports = authController;