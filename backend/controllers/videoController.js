const path = require("path");
const Session = require("../models/Session");
const { runAI } = require("../services/pythonService");
const logger = require("../utils/logger");
// const { sendSMS, makeCall } = require("../services/alertService.js"); // adjust path if needed
// @route  POST /api/video/upload/:sessionId
// @access Operator+
const uploadVideo = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (session.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ success: false, message: "Session is not active" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video file uploaded" });
    }

    // Save video path to session
    session.videoPath = req.file.path;
    await session.save();

    logger.info(`Video uploaded for session ${session._id}: ${req.file.path}`);

    res.status(200).json({
      success: true,
      message: "Video uploaded successfully. Call /process to start AI.",
      sessionId: session._id,
      videoPath: req.file.path,
      videoUrl: `${req.protocol}://${req.get('host')}/videos/${path.basename(req.file.path)}`,
    });
//    console.log("🔥 ALERT BLOCK REACHED");
// await sendSMS("🔥 AgniSight Alert: New video uploaded and processing started.");
// await makeCall("AgniSight Alert. A new packing session video has been uploaded. Please check the dashboard.")
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/video/process/:sessionId
// @access Operator+
const processVideo = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (!session.videoPath) {
      return res.status(400).json({ success: false, message: "No video uploaded for this session" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ success: false, message: "Session is not active" });
    }

    const io = req.app.get("io");

    // Respond immediately — processing runs in background
    res.status(200).json({
      success: true,
      message: "AI processing started. Connect to socket room to receive live updates.",
      sessionId: session._id,
      socketRoom: session._id.toString(),
    });

    // Run AI in background (non-blocking)
    runAI(
      session._id,
      path.resolve(session.videoPath),
      {
        yoloConfThreshold: session.yoloConfThreshold,
        yoloIouThreshold: session.yoloIouThreshold,
      },
      io
    ).catch((err) => {
      logger.error(`Background AI error for session ${session._id}: ${err.message}`);
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { uploadVideo, processVideo };