const express = require("express");
const router = express.Router();
const { exportSessionCSV, exportSessionExcel } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(restrictTo("manager", "admin"));

router.get("/:sessionId/csv",   exportSessionCSV);
router.get("/:sessionId/excel", exportSessionExcel);

module.exports = router;