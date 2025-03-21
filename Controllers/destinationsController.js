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
            if (tags && tags.length > 0) {
                console.log("du ma m an hong",tags)
                const [tagCheck] = await connection.query(
                    'SELECT tag_id FROM tags WHERE tag_id IN (?)',
                    [tags]
                );
                const array = tags.slice();
                console.log(array)
                while (array.length > 0) {
                    const newarray = array.shift(); // Lấy và xóa phần tử đầu tiên của mảng
                    const [check] = await connection.query(
                        'SELECT * FROM destination_Tags WHERE destination_id = ? and tag_id =?',
                        [destinationId, newarray]
                    );
                    console.log(destinationId,newarray)
                    if (check === 0 ){
                        return res.status(400).json({ error: `điểm đến này đã được tạo gòi thằng lồn` });
                    }
                }

                if (tagCheck.length = 0) {
                    return res.status(400).json({ error: `Các tag_id không hợp lệ: ${invalidTags.join(', ')}` });
                }
                while (tags.length > 0) {
                    const tag = tags.shift(); // Lấy và xóa phần tử đầu tiên của mảng
            
                    await connection.query(
                        'INSERT INTO destination_Tags (destination_id, tag_id) VALUES (?, ?)',
                        [destinationId, tag]
                    );
                    console.log(`Đã thêm tag ${tag} vào database.`);
                }
            }

            // Lưu video vào bảng Media
            if (req.files["video"]) {
                for (let img of req.files["video"]) {
                    const videoUrl = img.path || img.filename; // Lấy đường dẫn ảnh
                    await connection.query(
                        "INSERT INTO media (destination_id, media_url, media_type) VALUES (?, ?, ?)",
                        [destinationId, videoUrl, "video"]
                    );
                }
            }
            if (req.files["images"]) {
                for (let img of req.files["images"]) {
                    const imageUrl = img.path || img.filename; // Lấy đường dẫn ảnh
                    await connection.query(
                        "INSERT INTO media (destination_id, media_url, media_type) VALUES (?, ?, ?)",
                        [destinationId, imageUrl, "image"]
                    );
                }
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
    const { trip_id } = req.params;

    try {
        // 🟢 Truy vấn danh sách điểm đến của trip_id
        const [rows] = await connection.query(
            `SELECT d.destination_id, d.trip_id, d.name, d.description, d.latitude, d.longitude, d.created_at,
                    t.title AS trip_title,
                    GROUP_CONCAT(dt.tag_id) AS tag_ids,
                    GROUP_CONCAT(tg.name) AS tag_names
            FROM destinations d
            LEFT JOIN trips t ON d.trip_id = t.trip_id
            LEFT JOIN destination_Tags dt ON d.destination_id = dt.destination_id
            LEFT JOIN tags tg ON dt.tag_id = tg.tag_id
            WHERE d.trip_id = ?
            GROUP BY d.destination_id`,
            [trip_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy điểm đến nào cho chuyến đi này" });
        }

        // 🟢 Chuẩn hóa dữ liệu tags
        const destinations = rows.map(destination => ({
            ...destination,
            tags: destination.tag_ids
                ? destination.tag_ids.split(',').map((tag_id, index) => ({
                    tag_id: parseInt(tag_id),
                    tag_name: destination.tag_names.split(',')[index]
                }))
                : [],
            tag_ids: undefined,
            tag_names: undefined
        }));

        // 🟢 Lấy danh sách media theo danh sách destination_id
        const destinationIds = destinations.map(d => d.destination_id);
        if (destinationIds.length > 0) {
            const [mediaRows] = await connection.query(
                `SELECT * FROM media WHERE destination_id IN (?)`,
                [destinationIds]
            );

            const mediaMap = {};
            mediaRows.forEach(media => {
                if (!mediaMap[media.destination_id]) {
                    mediaMap[media.destination_id] = [];
                }

                // Chuẩn hóa đường dẫn ảnh
                let fixedPath = media.media_url.replace(/\\/g, "/");
                fixedPath = fixedPath.replace(/^uploads\//, "");

                mediaMap[media.destination_id].push({
                    ...media,
                    media_url: `http://localhost:3000/uploads/${fixedPath}`
                });
            });

            // Gán media vào từng điểm đến
            destinations.forEach(destination => {
                destination.media = mediaMap[destination.destination_id] || [];
            });
        }

        // 🟢 Lấy danh sách hoạt động theo danh sách destination_id
        const [activityRows] = await connection.query(
            `SELECT * FROM activities WHERE destination_id IN (?)`,
            [destinationIds]
        );

        // Nhóm hoạt động theo destination_id
        const activityMap = {};
        activityRows.forEach(activity => {
            if (!activityMap[activity.destination_id]) {
                activityMap[activity.destination_id] = [];
            }
            activityMap[activity.destination_id].push(activity);
        });

        // Gán danh sách hoạt động vào từng điểm đến
        destinations.forEach(destination => {
            destination.activities = activityMap[destination.destination_id] || [];
        });

        // 🔥 Trả kết quả về client
        res.json(destinations);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách điểm đến:", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách điểm đến" });
    }
};



// ✅ API lấy điểm đến theo trip_id kèm danh sách tags
// router.get('/:trip_id', async (req, res) => {
//     const tripId = req.params.trip_id;

//     try {
//         // Lấy danh sách điểm đến thuộc trip_id
//         const [destinations] = await pool.query(`
//             SELECT d.destination_id, d.name, d.description, d.latitude, d.longitude
//             FROM Destinations d
//             WHERE d.trip_id = ?
//         `, [tripId]);

//         if (destinations.length === 0) {
//             return res.status(404).json({ error: 'Không tìm thấy điểm đến!' });
//         }

//         // Lấy danh sách tags cho từng điểm đến
//         for (let destination of destinations) {
//             const [tags] = await pool.query(`
//                 SELECT tag_id FROM Destination_Tags WHERE destination_id = ?
//             `, [destination.destination_id]);

//             destination.tags = tags.map(tag => tag.tag_id);
//         }

//         res.status(200).json({
//             message: 'Lấy điểm đến thành công!',
//             destinations
//         });

//     } catch (error) {
//         console.error("Lỗi khi lấy điểm đến:", error);
//         res.status(500).json({ error: "Lỗi server!" });
//     }
// });

module.exports = {
    createDestination,
    getDestination
};
