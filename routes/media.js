const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const connection = require('../config/db');


const uploadDir = 'uploads/';
// Tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Middleware upload file
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload ảnh (.jpg, .png) hoặc video (.mp4)!'));
        }
    }
}).fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 1 }]);

// ✅ API Upload ảnh & video
router.post('/upload', (req, res) => {
    upload(req, res, async function (err) {
        if (err) return res.status(400).json({ error: err.message });

        const { trip_id, name, description, latitude, longitude } = req.body;

        // 1. Insert vào bảng destinations
        const insertDestination = `INSERT INTO destinations (trip_id, name, description, latitude, longitude, created_at)
                                VALUES (?, ?, ?, ?, ?, NOW())`;

        connection.query(insertDestination, [trip_id, name, description, latitude, longitude], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Lỗi khi lưu destination' });
            }

            const destination_id = result.insertId;

            // 2. Lưu media tương ứng nếu có file
            const files = {
                images: req.files['images'] || [],
                videos: req.files['videos'] || []
            };

            const insertMedia = `INSERT INTO media (destination_id, media_url, media_type, caption)
                                 VALUES (?, ?, ?, ?)`;

            files.images.forEach(file => {
                connection.query(insertMedia, [destination_id, `/uploads/${file.filename}`, 'image', file.originalname]);
            });

            files.videos.forEach(file => {
                connection.query(insertMedia, [destination_id, `/uploads/${file.filename}`, 'video', file.originalname]);
            });

            res.status(200).json({
                message: 'Lưu destination và media thành công!',
                destination_id,
                uploaded: {
                    images: files.images.map(f => f.filename),
                    videos: files.videos.map(f => f.filename)
                }
            });
        });
    });
});
router.get('/destinations', async (req, res) => {
    try {
        const destinationsQuery = `
            SELECT * FROM destinations
            ORDER BY created_at DESC
        `;

        connection.query(destinationsQuery, (err, destinations) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Lỗi khi lấy danh sách điểm đến' });
            }

            // Nếu không có điểm đến nào
            if (destinations.length === 0) {
                return res.status(200).json([]);
            }

            // Lấy tất cả destination_id
            const ids = destinations.map(d => d.destination_id);

            const mediaQuery = `
                SELECT * FROM media
                WHERE destination_id IN (?)
            `;

            connection.query(mediaQuery, [ids], (err, mediaResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Lỗi khi lấy media' });
                }

                // Nhóm media theo destination_id
                const mediaByDestination = {};
                mediaResults.forEach(media => {
                    if (!mediaByDestination[media.destination_id]) {
                        mediaByDestination[media.destination_id] = [];
                    }
                    mediaByDestination[media.destination_id].push(media);
                });

                // Gộp media vào mỗi destination
                const result = destinations.map(dest => ({
                    ...dest,
                    media: mediaByDestination[dest.destination_id] || []
                }));

                res.status(200).json(result);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
});


module.exports = router;
