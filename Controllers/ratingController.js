const connection = require('../config/db');

const ratingController = {
    // Thêm đánh giá cho hành trình
    addRating: async (req, res) => {
        try {
            const { trip_id, score } = req.body;
            const user_id = req.user?.user_id; // Lấy user_id từ token qua middleware

            // Kiểm tra dữ liệu đầu vào
            if (!user_id) return res.status(401).json({ message: 'Người dùng chưa xác thực' });
            if (!trip_id || !score) return res.status(400).json({ message: 'Vui lòng cung cấp trip_id và score' });
            
            // Kiểm tra score hợp lệ (1-5)
            if (!Number.isInteger(score) || score < 1 || score > 5) {
                return res.status(400).json({ message: 'Score phải là số nguyên từ 1 đến 5' });
            }

            // Kiểm tra xem người dùng đã đánh giá chưa
            const checkQuery = 'SELECT * FROM ratings WHERE trip_id = ? AND user_id = ?';
            const [existingRating] = await connection.execute(checkQuery, [trip_id, user_id]);
            if (existingRating.length > 0) {
                return res.status(400).json({ message: 'Bạn đã đánh giá hành trình này rồi' });
            }

            // Thêm đánh giá
            const insertQuery = 'INSERT INTO ratings (trip_id, user_id, score) VALUES (?, ?, ?)';
            const [result] = await connection.execute(insertQuery, [trip_id, user_id, score]);

            res.status(201).json({
                message: 'Thêm đánh giá thành công',
                rating_id: result.insertId
            });
        } catch (err) {
            console.error('Lỗi thêm đánh giá:', err);
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'trip_id không tồn tại' });
            }
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    },
    getRatingsByUser: async (req, res) => {
        const userId = req.user.user_id; // Lấy user_id từ token qua middleware
    
        try {
            const [rows] = await connection.query(
                `SELECT r.rating_id, r.trip_id, r.score, r.created_at,
                        t.title AS trip_title
                 FROM ratings r
                 JOIN trips t ON r.trip_id = t.trip_id
                 WHERE r.user_id = ?`,
                [userId]
            );
    
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Người dùng chưa có đánh giá nào' });
            }
    
            res.json({
                user_id: parseInt(userId),
                ratings: rows
            });
        } catch (error) {
            console.error('Lỗi lấy đánh giá:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }    
};

module.exports = ratingController;
