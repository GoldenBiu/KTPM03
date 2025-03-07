const connection = require('../config/db');

const likeController = {
    // Toggle Like hành trình
    toggleLike: async (req, res) => {
        const { trip_id } = req.body;
        const user_id = req.user.user_id; // Lấy user_id từ token qua middleware

        try {
            // Kiểm tra dữ liệu đầu vào
            if (!trip_id) {
                return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });
            }

            // Kết nối database (nếu connection là Promise)
            const db = await connection;

            // Kiểm tra xem user đã like chưa
            const query = 'SELECT * FROM likes WHERE trip_id = ? AND user_id = ?';
            const [results] = await db.query(query, [trip_id, user_id]);

            if (results.length > 0) {
                // Nếu đã like, xóa lượt like
                const deleteQuery = 'DELETE FROM likes WHERE trip_id = ? AND user_id = ?';
                await db.query(deleteQuery, [trip_id, user_id]);
                return res.json({ message: 'Đã xóa lượt thích' });
            } else {
                // Nếu chưa like, thêm lượt like
                const insertQuery = 'INSERT INTO likes (trip_id, user_id) VALUES (?, ?)';
                const [result] = await db.query(insertQuery, [trip_id, user_id]);
                return res.status(201).json({
                    message: 'Thích hành trình thành công',
                    like_id: result.insertId
                });
            }
        } catch (err) {
            // Xử lý lỗi
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'trip_id không tồn tại' });
            }
            return res.status(500).json({
                message: 'Lỗi server',
                error: err.message // Trả về chi tiết lỗi để debug dễ hơn
            });
        }
    }
};

module.exports = likeController;