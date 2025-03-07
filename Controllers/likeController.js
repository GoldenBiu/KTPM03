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
        },

        getLikedTripsByUser :async (req, res) => {
            const userId = req.user.user_id;
        
            try {
                const [rows] = await connection.query(
                    `SELECT t.trip_id, t.title, t.created_at, 
                            u.username AS author
                    FROM likes l
                    JOIN trips t ON l.trip_id = t.trip_id
                    JOIN users u ON t.user_id = u.user_id
                    WHERE l.user_id = ?`,
                    [userId]
                );
        
                if (rows.length === 0) {
                    return res.status(404).json({ message: 'Người dùng chưa thích bài viết nào' });
                }
        
                res.json({
                    user_id: parseInt(userId),
                    liked_trips: rows
                });
            } catch (error) {
                console.error('Lỗi lấy danh sách bài viết đã thích:', error);
                res.status(500).json({ message: 'Lỗi server', error: error.message });
            }
        }
    };

    module.exports = likeController;