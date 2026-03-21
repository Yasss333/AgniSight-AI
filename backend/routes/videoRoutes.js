const express = require("express");
const router = express.Router();
const { uploadVideo, processVideo, stopProcessing } = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.post("/upload/:sessionId",  upload.single("video"), uploadVideo);
router.post("/process/:sessionId", processVideo);
router.post("/stop/:sessionId",    stopProcessing);

module.exports = router;