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
    },
    // Cập nhật thông tin người dùng
    updateUser: async (req, res) => {
        console.log('Token User ID:', req.user); // Log toàn bộ thông tin user từ token
        console.log('Route User ID:', req.params.id); // Log ID từ route
        console.log('Request Body:', req.body); // Log dữ liệu gửi lên

        const token_user_id = req.user.user_id; // Lấy user_id từ token đã xác thực
        const route_user_id = req.params.id; // Lấy user_id từ route parameter

        // Kiểm tra xem người dùng có quyền cập nhật hồ sơ này không
        if (token_user_id !== parseInt(route_user_id)) {
            console.log(`Unauthorized update attempt: Token ID ${token_user_id} vs Route ID ${route_user_id}`);
            return res.status(403).json({ 
                message: 'Bạn không có quyền cập nhật hồ sơ này',
                token_user_id: token_user_id,
                route_user_id: route_user_id
            });
        }

        const { username, profile_image, bio } = req.body;

        // Kiểm tra xem có thông tin để cập nhật không
        if (!username && !profile_image && !bio) {
            return res.status(400).json({ message: 'Không có thông tin để cập nhật' });
        }

        try {
            // Chuẩn bị truy vấn cập nhật
            const updateFields = [];
            const updateValues = [];

            if (username) {
                updateFields.push('username = ?');
                updateValues.push(username);
            }
            if (profile_image) {
                updateFields.push('profile_image = ?');
                updateValues.push(profile_image);
            }
            if (bio) {
                updateFields.push('bio = ?');
                updateValues.push(bio);
            }

            // Thêm user_id vào cuối mảng giá trị
            updateValues.push(token_user_id);

            // Thực hiện cập nhật
            const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
            console.log('Update Query:', updateQuery);
            console.log('Update Values:', updateValues);

            const [result] = await connection.query(updateQuery, updateValues);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật' });
            }
            
            res.set('Content-Type', 'application/json; charset=utf-8');
            res.json({ 
                message: 'Cập nhật thông tin người dùng thành công',
                updatedFields: updateFields
            });

        } catch (error) {
            console.error('Update Error:', error);
            // Kiểm tra lỗi trùng lặp username (nếu có)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Username đã tồn tại' });
            }
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};




module.exports = authController;