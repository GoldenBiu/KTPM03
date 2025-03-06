const connection = require('../config/db');

const ratingController = {
    // Thêm đánh giá cho hành trình
    addRating: (req, res) => {
        const { trip_id, score } = req.body;
        const user_id = req.user.user_id; // Lấy user_id từ token qua middleware

        // Kiểm tra dữ liệu đầu vào
        if (!trip_id || !score) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trip_id và score' });
        }

        // Kiểm tra score hợp lệ (1-5)
        if (!Number.isInteger(score) || score < 1 || score > 5) {
            return res.status(400).json({ message: 'Score phải là số nguyên từ 1 đến 5' });
        }

        const ratingData = {
            trip_id,
            user_id,
            score
        };

        const query = 'INSERT INTO Ratings (trip_id, user_id, score) VALUES (?, ?, ?)';
        connection.query(query, [ratingData.trip_id, ratingData.user_id, ratingData.score], (err, result) => {
            if (err) {
                if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(400).json({ message: 'trip_id không tồn tại' });
                }
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Bạn đã đánh giá hành trình này rồi' });
                }
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }
            res.status(201).json({
                message: 'Thêm đánh giá thành công',
                rating_id: result.insertId
            });
        });
    }
};

module.exports = ratingController;