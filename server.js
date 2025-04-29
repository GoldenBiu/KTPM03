const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// const baseUrl = 'https://ktpm03.onrender.com/uploads/';
const baseUrl = process.env.BASE_URL || 'https://ktpm03.onrender.com/uploads/';

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trip');
const commentRoutes = require('./routes/comment');
const ratingRoutes = require('./routes/rating');
const likeRoutes = require('./routes/like');
const bookmarkRoutes = require('./routes/bookmark');
const tagRoutes = require('./routes/tag');
const destinationsRouter = require('./routes/destinations');
const mediaRoutes = require('./routes/media');
const cors = require('cors');
app.use(cors());
// Middleware để parse JSON
app.use(express.json());

// Sử dụng routes
app.use('/api', authRoutes);
app.use('/api', tripRoutes);
app.use('/api', commentRoutes);
app.use('/api', ratingRoutes);
app.use('/api', likeRoutes);
app.use('/api', bookmarkRoutes);
app.use('/api', tagRoutes);
app.use('/api', destinationsRouter);
app.use('/api', mediaRoutes);

// Cấu hình để phục vụ file tĩnh từ thư mục uploads
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Tạo thư mục uploads nếu chưa có
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file theo timestamp
    }
});

// Middleware upload file
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Giới hạn 100MB
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
app.post('/api/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        console.log("Files nhận được:", req.files);

        if (!req.files || (!req.files['images'] && !req.files['videos'])) {
            return res.status(400).json({ error: 'Không có file nào được upload' });
        }

        // Lấy danh sách file đã upload
        const images = req.files['images'] ? req.files['images'].map(file => file.filename) : [];
        const videos = req.files['videos'] ? req.files['videos'].map(file => file.filename) : [];

        res.status(200).json({
            message: 'Upload thành công!',
            images: images.map(filename => baseUrl + filename),
            videos: videos.map(filename => baseUrl + filename)
        });
    });
});

// ✅ API GET danh sách file đã upload (trả về URL đầy đủ)
app.get('/api/media', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi khi đọc thư mục uploads', details: err.message });
        }

        const images = files.filter(file => file.match(/\.(jpg|jpeg|png)$/));
        const videos = files.filter(file => file.match(/\.(mp4)$/));

        res.status(200).json({
            message: 'Danh sách file đã upload',
            images: images.map(filename => baseUrl + filename),
            videos: videos.map(filename => baseUrl + filename)
        });
    });
});

// ✅ API phục vụ file ảnh/video trực tiếp
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Khởi động server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${port}`);
});
