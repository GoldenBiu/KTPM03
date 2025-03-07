const connection = require('../config/db');

const bookmarkController = {
    // Toggle Bookmark hành trình
    toggleBookmark: async (req, res) => {
        try {
            const { trip_id } = req.body;
            const user_id = req.user.user_id; // Lấy user_id từ token qua middleware

            if (!trip_id) {
                return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });
            }

            // Kiểm tra xem user đã bookmark chưa
            const checkQuery = 'SELECT * FROM Bookmarks WHERE trip_id = ? AND user_id = ?';
            const [results] = await connection.promise().query(checkQuery, [trip_id, user_id]);

            if (results.length > 0) {
                // Nếu đã bookmark, xóa bookmark
                const deleteQuery = 'DELETE FROM Bookmarks WHERE trip_id = ? AND user_id = ?';
                await connection.promise().query(deleteQuery, [trip_id, user_id]);
                return res.json({ message: 'Đã xóa bookmark' });
            }

            // Nếu chưa bookmark, thêm bookmark
            const insertQuery = 'INSERT INTO Bookmarks (trip_id, user_id) VALUES (?, ?)';
            const [insertResult] = await connection.promise().query(insertQuery, [trip_id, user_id]);

            res.status(201).json({
                message: 'Bookmark hành trình thành công',
                bookmark_id: insertResult.insertId
            });

        } catch (err) {
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'trip_id không tồn tại' });
            }
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    }
};

module.exports = bookmarkController;
