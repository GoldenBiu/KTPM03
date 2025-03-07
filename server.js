const express = require('express');
const app = express();
const port = 3000;
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trip');
const commentRoutes = require('./routes/comment');
const ratingRoutes = require('./routes/rating');
const likeRoutes = require('./routes/like');
const bookmarkRoutes = require('./routes/bookmark');



// Middleware để parse JSON
app.use(express.json());

// Sử dụng routes
app.use('/api', tripRoutes);
app.use('/api', commentRoutes);
app.use('/api', authRoutes);
app.use('/api', ratingRoutes);
app.use('/api', likeRoutes);
app.use('/api', bookmarkRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${port}`);
});