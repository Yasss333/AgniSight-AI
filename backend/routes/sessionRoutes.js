const express = require("express");
const router = express.Router();
const {
  createSession,
  stopSession,
  getAllSessions,
  getMySessions,
  getSessionById,
  getSessionLogs,
  getSessionSnapshots,
  getSessionAnalytics,
} = require("../controllers/sessionController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const { validate, createSessionSchema } = require("../validation/sessionValidation");

router.use(protect); // All session routes require login

router.post("/",          validate(createSessionSchema), createSession);
router.get("/",           restrictTo("manager", "admin"), getAllSessions);
router.get("/my",         getMySessions);
router.get("/:id",        getSessionById);
router.patch("/:id/stop", stopSession);
router.get("/:id/logs",       getSessionLogs);
router.get("/:id/snapshots",  getSessionSnapshots);
router.get("/:id/analytics",  getSessionAnalytics);

module.exports = router;