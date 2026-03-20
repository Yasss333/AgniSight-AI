const express = require("express");
const router = express.Router();
const { downloadReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/:sessionId", downloadReport);

module.exports = router;