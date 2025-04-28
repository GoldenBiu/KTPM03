const connection = require('../config/db');

const bookmarkController = {
    // Toggle Bookmark hành trình
    toggleBookmark: async (req, res) => {
        try {
            const { trip_id } = req.body;
            const user_id = req.user.user_id; // Lấy user_id từ token qua middleware

            // Kiểm tra dữ liệu đầu vào
            if (!trip_id) {
                return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });
            }

            // Lấy kết nối database
            const db = await connection;

            // Kiểm tra xem user đã bookmark chưa
            const checkQuery = 'SELECT * FROM bookmarks WHERE trip_id = ? AND user_id = ?';
            const [rows] = await db.query(checkQuery, [trip_id, user_id]);

            if (rows.length > 0) {
                // Nếu đã bookmark, xóa bookmark
                const deleteQuery = 'DELETE FROM bookmarks WHERE trip_id = ? AND user_id = ?';
                await db.query(deleteQuery, [trip_id, user_id]);
                return res.json({ message: 'Đã xóa bookmark' });
            }

            // Nếu chưa bookmark, thêm bookmark
            const insertQuery = 'INSERT INTO bookmarks (trip_id, user_id) VALUES (?, ?)';
            const [insertResult] = await db.query(insertQuery, [trip_id, user_id]);

            return res.status(201).json({
                message: 'Bookmark hành trình thành công',
                bookmark_id: insertResult.insertId
            });
        } catch (err) {
            // Xử lý lỗi cụ thể
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'trip_id không tồn tại' });
            }
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Bookmark đã tồn tại' });
            }
            console.error('Lỗi trong toggleBookmark:', err); // Log lỗi để debug
            return res.status(500).json({
                message: 'Lỗi server',
                error: err.message || 'Lỗi không xác định'
            });
        }
    },
    getAllBookmarks: async (req, res) => {
        try {
            const user_id = req.user.user_id;

            if (!user_id) {
                return res.status(401).json({ message: 'Người dùng chưa xác thực' });
            }   

            const db = await connection;

            const query = 'SELECT * FROM bookmarks WHERE user_id = ?';
            const [results] = await db.query(query, [user_id]);

            res.json({
                message: 'Lấy tất cả bookmark thành công',
                bookmarks: results
            });
        } catch (err) {
            console.error('Lỗi trong getAllBookmarks:', err);
            res.status(500).json({
                message: 'Lỗi server',
                error: err.message || 'Lỗi không xác định'
            });
        }
    }
};

module.exports = bookmarkController;