const express = require("express");
const router = express.Router();
const { uploadVideo, processVideo } = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.post("/upload/:sessionId",  upload.single("video"), uploadVideo);
router.post("/process/:sessionId", processVideo);

module.exports = router;