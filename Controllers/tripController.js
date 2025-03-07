const connection = require('../config/db');

const tripController = {
    // Tạo hành trình mới
    createTrip: async (req, res) => {
        try {
            const user_id = req.user?.user_id; // Kiểm tra user_id
            const { title, start_date, end_date, is_public } = req.body;

            if (!user_id) return res.status(401).json({ message: 'Người dùng chưa xác thực' });
            if (!title) return res.status(400).json({ message: 'Vui lòng cung cấp title' });

            const query = `
                INSERT INTO trips (user_id, title, start_date, end_date, is_public)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await connection.execute(query, [user_id, title, start_date || null, end_date || null, is_public ?? 1]);

            res.status(201).json({ message: 'Tạo hành trình thành công', trip_id: result.insertId });
        } catch (err) {
            console.error('Lỗi tạo hành trình:', err);
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    },

    // Lấy tất cả hành trình của user
    getAllTrips: async (req, res) => {
        try {
            const user_id = req.user?.user_id;
            if (!user_id) return res.status(401).json({ message: 'Người dùng chưa xác thực' });

            const query = 'SELECT * FROM trips';
            const [results] = await connection.execute(query);

            res.json({ message: 'Lấy tất cả hành trình thành công', trips: results });
        } catch (err) {
            console.error('Lỗi lấy hành trình:', err);
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    },

    // Cập nhật hành trình
    updateTrip: async (req, res) => {
        try {
            const user_id = req.user?.user_id;
            const { trip_id } = req.params;
            const { title, start_date, end_date, is_public } = req.body;

            if (!user_id) return res.status(401).json({ message: 'Người dùng chưa xác thực' });
            if (!trip_id) return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });

            const query = `
                UPDATE trips SET title = ?, start_date = ?, end_date = ?, is_public = ?
                WHERE trip_id = ? AND user_id = ?
            `;
            const [result] = await connection.execute(query, [title, start_date, end_date, is_public, trip_id, user_id]);

            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy hành trình hoặc không có quyền chỉnh sửa' });

            res.json({ message: 'Cập nhật hành trình thành công' });
        } catch (err) {
            console.error('Lỗi cập nhật hành trình:', err);
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    },

    // Xóa hành trình
    deleteTrip: async (req, res) => {
        try {
            const user_id = req.user?.user_id;
            const { trip_id } = req.params;

            if (!user_id) return res.status(401).json({ message: 'Người dùng chưa xác thực' });
            if (!trip_id) return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });

            const query = 'DELETE FROM trips WHERE trip_id = ? AND user_id = ?';
            const [result] = await connection.execute(query, [trip_id, user_id]);

            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy hành trình hoặc không có quyền xóa' });

            res.json({ message: 'Xóa hành trình thành công' });
        } catch (err) {
            console.error('Lỗi xóa hành trình:', err);
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    },

    // Lấy thông tin hành trình theo trip_id
    getTripById: async (req, res) => {
        try {
            const { trip_id } = req.params;
            if (!trip_id) return res.status(400).json({ message: 'Vui lòng cung cấp trip_id' });

            // Lấy thông tin hành trình
            const tripQuery = 'SELECT * FROM trips WHERE trip_id = ?';
            const [tripResults] = await connection.execute(tripQuery, [trip_id]);

            if (tripResults.length === 0) return res.status(404).json({ message: 'Không tìm thấy hành trình' });

            // Lấy danh sách đánh giá
            const ratingsQuery = `
                SELECT r.rating_id, r.trip_id, r.user_id, r.score, r.created_at, u.username
                FROM ratings r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.trip_id = ?
                ORDER BY r.created_at DESC
            `;
            const [ratingResults] = await connection.execute(ratingsQuery, [trip_id]);

            res.json({ message: 'Lấy thông tin hành trình thành công', trip: tripResults[0], ratings: ratingResults });
        } catch (err) {
            console.error('Lỗi lấy hành trình theo ID:', err);
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    },

    // Lấy danh sách hành trình theo lượt thích
    getTripsByLikes: async (req, res) => {
        try {
            const query = `
                SELECT 
                    t.trip_id, t.user_id, t.title, t.start_date, t.end_date, t.is_public, t.created_at, t.updated_at,
                    COUNT(l.like_id) AS like_count
                FROM trips t
                LEFT JOIN likes l ON t.trip_id = l.trip_id
                WHERE t.is_public = 1
                GROUP BY t.trip_id
                ORDER BY like_count DESC
            `;
            const [results] = await connection.execute(query);

            res.json({ message: 'Lấy danh sách hành trình theo lượt thích thành công', trips: results });
        } catch (err) {
            console.error('Lỗi lấy danh sách hành trình theo lượt thích:', err);
            res.status(500).json({ message: 'Lỗi server', error: err });
        }
    }
};

module.exports = tripController;
