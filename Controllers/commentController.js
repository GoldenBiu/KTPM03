const connection = require('../config/db');

const commentController = {
    // Thêm bình luận cho hành trình
    addComment: (req, res) => {
        const { trip_id, content } = req.body;
        const user_id = req.user.user_id; // Lấy user_id từ token qua middleware

        // Kiểm tra dữ liệu đầu vào
        if (!trip_id || !content) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trip_id và content' });
        }

        const commentData = {
            trip_id,
            user_id,
            content
        };

        const query = 'INSERT INTO Comments (trip_id, user_id, content) VALUES (?, ?, ?)';
        connection.query(query, [commentData.trip_id, commentData.user_id, commentData.content], (err, result) => {
            if (err) {
                if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(400).json({ message: 'trip_id không tồn tại' });
                }
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }
            res.status(201).json({
                message: 'Thêm bình luận thành công',
                comment_id: result.insertId
            });
        });
    },

    // Lấy tất cả bình luận của một hành trình
    getCommentsByTripId: (req, res) => {
        const { trip_id } = req.params;

        if (!trip_id) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });
        }

        const query = `
            SELECT c.comment_id, c.trip_id, c.user_id, c.content, c.created_at, u.username
            FROM Comments c
            JOIN Users u ON c.user_id = u.user_id
            WHERE c.trip_id = ?
            ORDER BY c.created_at DESC
        `;
        connection.query(query, [trip_id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }
            res.json({
                message: 'Lấy bình luận thành công',
                comments: results
            });
        });
    },




    
};

module.exports = commentController;