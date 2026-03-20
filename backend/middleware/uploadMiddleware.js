const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.VIDEO_UPLOAD_DIR || "../data/videos";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${req.user._id}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".mp4", ".avi", ".mov", ".mkv"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed (mp4, avi, mov, mkv)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB) || 500) * 1024 * 1024,
  },
});

module.exports = upload;