const connection = require('../config/db');

const createDestination = async (req, res) => {
    const { trip_id, name, description, latitude, longitude, tags } = req.body;

    if (!trip_id || !name) {
        return res.status(400).json({ error: 'trip_id và name là bắt buộc' });
    }
    if (tags && !Array.isArray(tags)) {
        return res.status(400).json({ error: 'tags phải là một mảng' });
    }

    try {
        // Kiểm tra trip_id có tồn tại không
        const [tripCheck] = await connection.query(
            'SELECT trip_id FROM trips WHERE trip_id = ?',
            [trip_id]
        );
        if (tripCheck.length === 0) {
            return res.status(400).json({ error: 'trip_id không tồn tại' });
        }

        // Thêm vào bảng Destinations
        const [result] = await connection.query(
            `INSERT INTO destinations (trip_id, name, description, latitude, longitude)
            VALUES (?, ?, ?, ?, ?)`,
            [trip_id, name, description || null, latitude || null, longitude || null]
        );
        const destinationId = result.insertId;

        // Nếu có tags, thêm vào bảng Destination_Tags
        if (tags && tags.length > 0) {
            const [tagCheck] = await connection.query(
                'SELECT tag_id FROM tags WHERE tag_id IN (?)',
                [tags]
            );
            const validTagIds = tagCheck.map(row => row.tag_id);
            const invalidTags = tags.filter(tag => !validTagIds.includes(tag));
            console.log(tags)
            if (invalidTags.length > 0) {
                return res.status(400).json({ error: `Các tag_id không hợp lệ: ${invalidTags.join(', ')}` });
            }

            const tagValues = tags.map(tag_id => [destinationId, tag_id]);
            await connection.query(
                'INSERT INTO destination_Tags (destination_id, tag_id) VALUES ?',
                [tagValues]
            );
        }

        res.status(201).json({
            message: 'Thêm điểm đến thành công',
            destination_id: destinationId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Lỗi khi thêm điểm đến' });
    }
};

const getDestination = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await connection.query(
            `SELECT d.destination_id, d.trip_id, d.name, d.description, d.latitude, d.longitude, d.created_at,
                    t.title AS trip_title,
                    GROUP_CONCAT(dt.tag_id) AS tag_ids,
                    GROUP_CONCAT(tg.name) AS tag_names
            FROM destinations d
            LEFT JOIN trips t ON d.trip_id = t.trip_id
            LEFT JOIN destination_Tags dt ON d.destination_id = dt.destination_id
            LEFT JOIN tags tg ON dt.tag_id = tg.tag_id
            WHERE d.destination_id = ?
            GROUP BY d.destination_id`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy điểm đến' });
        }

        const destination = rows[0];
        destination.tags = destination.tag_ids
            ? destination.tag_ids.split(',').map((tag_id, index) => ({
                tag_id: parseInt(tag_id),
                tag_name: destination.tag_names.split(',')[index]
            }))
            : [];
        delete destination.tag_ids;
        delete destination.tag_names;

        res.json(destination);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy thông tin điểm đến' });
    }
};


module.exports = {
    createDestination,
    getDestination
};