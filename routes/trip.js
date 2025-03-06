const express = require('express');
const router = express.Router();
const tripController = require('../Controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

// Tạo hành trình
router.post('/trips', authMiddleware,tripController.createTrip);

// Lấy tất cả hành trình
router.get('/trips', authMiddleware,tripController.getAllTrips);

// Chỉnh sửa hành trình
router.put('/trips/:trip_id', authMiddleware,tripController.updateTrip);

// Xóa hành trình
router.delete('/trips/:trip_id', authMiddleware,tripController.deleteTrip);

// Route mới: Lấy một hành trình
router.get('/trips/:trip_id', tripController.getTripById);



module.exports = router;