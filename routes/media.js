const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.files || (!req.files['images'] && !req.files['videos'])) {
            return res.status(400).json({ error: 'Không có file nào được upload' });
        }

        const images = req.files['images'] ? req.files['images'].map(file => file.filename) : [];
        const videos = req.files['videos'] ? req.files['videos'].map(file => file.filename) : [];

        res.status(200).json({
            message: 'Upload thành công!',
            images: images,
            videos: videos
        });
    });
});

module.exports = router;
