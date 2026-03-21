const express = require("express");
const router = express.Router();
const { checkSpike, checkNoActivity, recordActivity, sendSMS, makeCall } = require("../services/alertService.js");
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
// Manual alert from dashboard (Twilio)
router.post("/:id/alert", restrictTo("manager", "admin"), async (req, res, next) => {
  try {
    const { type = "call", message } = req.body || {};
    const sessionId = req.params.id;
    const defaultMessage = `AgniSight Alert. Manual alert triggered from dashboard for session ${sessionId}. Please check the dashboard.`;

    if (type === "call") {
      await makeCall(message || defaultMessage);
      return res.json({ success: true, message: "Call alert sent" });
    }

    await sendSMS(message || defaultMessage);
    return res.json({ success: true, message: "SMS alert sent" });
  } catch (err) {
    return next(err);
  }
});
// ── TEMP TEST ROUTE — remove before final submission ──

router.post("/test-alert/:id", protect, async (req, res) => {
  const io   = req.app.get("io");
  const { type } = req.body;

  if (type === "spike") {
    await checkSpike(req.params.id, 2, 8, 999, io);
    return res.json({ success: true, message: "Spike alert fired" });
  }

  if (type === "no_activity") {
    // Force last activity to 3 minutes ago
    const { recordActivity } = require("../services/alertService");
    const key = req.params.id.toString();
    // Directly manipulate — only for testing
    await checkNoActivity(req.params.id, io);
    return res.json({ success: true, message: "No activity alert fired" });
  }

  res.json({ success: false, message: "Unknown type" });
});
module.exports = router;
