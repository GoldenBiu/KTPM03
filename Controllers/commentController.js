const connection = require('../config/db');

const commentController = {
    // Thêm bình luận cho hành trình
    addComment: async (req, res) => {
        try {
            const { trip_id, content } = req.body;
            const user_id = req.user.user_id; // Lấy user_id từ token qua middleware
            console.log (user_id,trip_id,content)
            // Kiểm tra user_id có tồn tại không (người dùng đã đăng nhập chưa)
            if (!user_id) {
                return res.status(401).json({ message: 'Người dùng chưa đăng nhập' });
            }

            // Kiểm tra dữ liệu đầu vào
            if (!trip_id || !content) {
                return res.status(400).json({ message: 'Vui lòng cung cấp trip_id và content' });
            }

            // Kiểm tra trip_id có tồn tại không
            const tripCheck = 'SELECT trip_id FROM trips WHERE trip_id = ?';
            const [tripCheck2] = await connection.execute(tripCheck, [trip_id]);

            if (tripCheck2.length === 0) {
                return res.status(404).json({ message: 'Hành trình không tồn tại' });
            }

            // Thêm bình luận
            const query = 'INSERT INTO comments (trip_id, user_id, content) VALUES (?, ?, ?)';
            const [results] = await connection.execute(query, [trip_id, user_id, content]);

            res.status(201).json({
                message: 'Thêm bình luận thành công',
                comment_id: results
            });

        } catch (err) {
            console.error('Lỗi khi thêm bình luận:', err);
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    },

    // Lấy tất cả bình luận của một hành trình
    getCommentsByTripId: async (req, res) => {
        try {
            const { trip_id } = req.params;

            if (!trip_id) {
                return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });
            }

            const query = `
                SELECT c.comment_id, c.trip_id, c.user_id, c.content, c.created_at, u.username
                FROM comments c
                JOIN users u ON c.user_id = u.user_id
                WHERE c.trip_id = ?
                ORDER BY c.created_at DESC
            `;
            const [results] = await connection.execute(query, [trip_id]);

            res.json({
                message: 'Lấy bình luận thành công',
                comments: results
            });

        } catch (err) {
            console.error('Lỗi khi lấy bình luận:', err);
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    }
};

module.exports = commentController;
