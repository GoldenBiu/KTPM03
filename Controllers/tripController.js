const connection = require('../config/db'); // Sửa từ 'db' thành 'connection'

const tripController = {
    // Tạo hành trình mới
    createTrip: (req, res) => {
        const { user_id, title, start_date, end_date, is_public } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!user_id || !title) {
            return res.status(400).json({ message: 'Vui lòng cung cấp user_id và title' });
        }

        // Chuẩn bị dữ liệu cho truy vấn
        const tripData = {
            user_id,
            title,
            start_date: start_date || null,
            end_date: end_date || null,
            is_public: is_public !== undefined ? is_public : 1
        };

        const query = 'INSERT INTO trips (user_id, title, start_date, end_date, is_public) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [tripData.user_id, tripData.title, tripData.start_date, tripData.end_date, tripData.is_public], (err, result) => { // Sửa 'db' thành 'connection'
            if (err) {
                if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(400).json({ message: 'user_id không tồn tại' });
                }
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }
            res.status(201).json({
                message: 'Tạo hành trình thành công',
                trip_id: result.insertId
            });
        });
    },

    // Lấy tất cả hành trình
    getAllTrips: (req, res) => {
        const query = 'SELECT * FROM trips';
        connection.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }
            res.json({
                message: 'Lấy tất cả hành trình thành công',
                trips: results
            });
        });
    },

    // Chỉnh sửa hành trình
    updateTrip: (req, res) => {
        const { trip_id } = req.params;
        const { title, start_date, end_date, is_public } = req.body;

        if (!trip_id) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });
        }

        // Chỉ cập nhật các trường được cung cấp
        const updates = {};
        if (title) updates.title = title;
        if (start_date) updates.start_date = start_date;
        if (end_date) updates.end_date = end_date;
        if (is_public !== undefined) updates.is_public = is_public;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ít nhất một trường để cập nhật' });
        }

        const query = 'UPDATE trips SET ? WHERE trip_id = ?';
        connection.query(query, [updates, trip_id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy hành trình' });
            }
            res.json({ message: 'Cập nhật hành trình thành công' });
        });
    },

    // Xóa hành trình
    deleteTrip: (req, res) => {
        const { trip_id } = req.params;

        if (!trip_id) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });
        }

        const query = 'DELETE FROM trips WHERE trip_id = ?';
        connection.query(query, [trip_id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy hành trình' });
            }
            res.json({ message: 'Xóa hành trình thành công' });
        });
    },

    /// Lấy thông tin hành trình và đánh giá theo trip_id
    getTripById: (req, res) => {
        const { trip_id } = req.params;

        if (!trip_id) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });
        }

        // Truy vấn thông tin hành trình
        const tripQuery = 'SELECT * FROM trips WHERE trip_id = ?';
        connection.query(tripQuery, [trip_id], (err, tripResults) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err });
            }
            if (tripResults.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy hành trình' });
            }

            const trip = tripResults[0];

            // Truy vấn tất cả đánh giá của hành trình
            const ratingsQuery = `
                SELECT r.rating_id, r.trip_id, r.user_id, r.score, r.created_at, u.username
                FROM ratings r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.trip_id = ?
                ORDER BY r.created_at DESC
            `;
            connection.query(ratingsQuery, [trip_id], (err, ratingResults) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi server', error: err });
                }

                res.json({
                    message: 'Lấy thông tin và đánh giá thành công',
                    trip: trip,
                    ratings: ratingResults
                });
            });
        });
    },




};

module.exports = tripController;