const multer = require("multer");
const path = require("path");

// Kiểm tra file ảnh
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Kiểm tra file video
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Bộ lọc file
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const allowedVideoTypes = ["video/mp4"];

  if (
    (file.fieldname === "images" && allowedImageTypes.includes(file.mimetype)) ||
    (file.fieldname === "video" && allowedVideoTypes.includes(file.mimetype))
  ) {
    cb(null, true);
  } else {
    cb(new Error("Định dạng file không hợp lệ"), false);
  }
};


// Khởi tạo multer
const upload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB cho video
  fileFilter: fileFilter,
}).fields([
  { name: "images", maxCount: 10 }, // 10 ảnh
  { name: "video", maxCount: 1 }, // 1 video
]);

module.exports = upload;
