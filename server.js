const express = require('express');
const app = express();
const port = 3000;
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trip');
const commentRoutes = require('./routes/comment');
const ratingRoutes = require('./routes/rating');

// Middleware để parse JSON
app.use(express.json());

// Sử dụng routes
app.use('/api', tripRoutes);
app.use('/api', commentRoutes);
app.use('/api', authRoutes);
app.use('/api', ratingRoutes);


// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});