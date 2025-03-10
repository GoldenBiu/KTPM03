const connection = require('../config/db');
const multer = require("multer");
const path = require("path");

// Cấu hình Multer cho upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, "uploads/images/");
        } else if (file.mimetype.startsWith("video/")) {
            cb(null, "uploads/videos/");
        } else {
            cb(new Error("Định dạng file không hợp lệ"), false);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB cho video
}).fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 }
]);

const createDestination = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

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

                if (invalidTags.length > 0) {
                    return res.status(400).json({ error: `Các tag_id không hợp lệ: ${invalidTags.join(', ')}` });
                }

                const tagValues = tags.map(tag_id => [destinationId, tag_id]);
                await connection.query(
                    'INSERT INTO destination_Tags (destination_id, tag_id) VALUES ?',
                    [tagValues]
                );
            }

            // Lưu ảnh vào bảng Media
            if (req.files["images"]) {
                for (let img of req.files["images"]) {
                    await connection.query(
                        "INSERT INTO media (destination_id, file_path, media_type) VALUES (?, ?, ?)",
                        [destinationId, img.path, "image"]
                    );
                }
            }

            // Lưu video vào bảng Media
            if (req.files["video"]) {
                const video = req.files["video"][0];
                await connection.query(
                    "INSERT INTO media (destination_id, file_path, media_type) VALUES (?, ?, ?)",
                    [destinationId, video.path, "video"]
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
    });
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

        // Lấy danh sách media
        const [media] = await connection.query(
            `SELECT file_path, media_type FROM media WHERE destination_id = ?`,
            [id]
        );
        destination.media = media;

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
