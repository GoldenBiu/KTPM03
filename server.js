const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

// Thiết lập BASE_URL để sử dụng trên server Render
const baseUrl = process.env.BASE_URL || 'https://ktpm03.onrender.com/uploads/';

// Import các route
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trip');
const commentRoutes = require('./routes/comment');
const ratingRoutes = require('./routes/rating');
const likeRoutes = require('./routes/like');
const bookmarkRoutes = require('./routes/bookmark');
const tagRoutes = require('./routes/tag');
const destinationsRouter = require('./routes/destinations');
const mediaRoutes = require('./routes/media');
const activitiesRoutes = require("./routes/activities"); // Import router
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
app.use('/destinations', destinationsRouter);
app.use('/api', mediaRoutes);
app.use('/api', activitiesRoutes); // Sử dụng router


// ✅ API phục vụ file ảnh/video trực tiếp
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Khởi động server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${port}`);
});
