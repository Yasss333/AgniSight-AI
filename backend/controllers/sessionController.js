const Session = require("../models/Session");
const Log = require("../models/Log");
const Snapshot = require("../models/Snapshot");
const logger = require("../utils/logger");

// @route  POST /api/sessions
// @access Operator+
const createSession = async (req, res, next) => {
  try {
    const { batchId, yoloConfThreshold, yoloIouThreshold } = req.body;

    // Check if operator already has an active session
    const existing = await Session.findOne({
      operatorId: req.user._id,
      status: "active",
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have an active session. Stop it before starting a new one.",
            activeSessionId: existing._id,  // ← add this
      });
    }

    const session = await Session.create({
      batchId,
      operatorId: req.user._id,
      yoloConfThreshold: yoloConfThreshold || 0.5,
      yoloIouThreshold: yoloIouThreshold || 0.45,
    });

    logger.info(`Session created: ${session._id} | Batch: ${batchId} | Operator: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      session,
    });
   


  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/sessions/:id/stop
// @access Operator+
const stopSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Operators can only stop their own sessions
    if (
      req.user.role === "operator" &&
      session.operatorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to stop this session" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ success: false, message: "Session is not active" });
    }

    // Get final box count from last log entry
    const lastLog = await Log.findOne({ sessionId: session._id }).sort({ frameNumber: -1 });
    const finalCount = lastLog ? lastLog.boxCount : 0;

    // Get avg FPS
    const fpsData = await Log.aggregate([
      { $match: { sessionId: session._id } },
      { $group: { _id: null, avgFps: { $avg: "$fps" }, totalFrames: { $sum: 1 } } },
    ]);

    session.status = "completed";
    session.endedAt = new Date();
    session.finalBoxCount = finalCount;
    session.avgFps = fpsData[0]?.avgFps ? parseFloat(fpsData[0].avgFps.toFixed(2)) : 0;
    session.totalFrames = fpsData[0]?.totalFrames || 0;
    await session.save();

    logger.info(`Session stopped: ${session._id} | Final count: ${finalCount}`);

    res.status(200).json({
      success: true,
      message: "Session stopped successfully",
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/sessions
// @access Manager+
const getAllSessions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Session.countDocuments();
    const sessions = await Session.find()
      .populate("operatorId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/sessions/my
// @access Operator+
const getMySessions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Session.countDocuments({ operatorId: req.user._id });
    const sessions = await Session.find({ operatorId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/sessions/:id
// @access Operator+
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate(
      "operatorId",
      "name email role"
    );

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Operators can only view their own sessions
    if (
      req.user.role === "operator" &&
      session.operatorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/sessions/:id/logs
// @access Operator+
const getSessionLogs = async (req, res, next) => {
  try {
    const logs = await Log.find({ sessionId: req.params.id }).sort({ frameNumber: 1 });
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/sessions/:id/snapshots
// @access Operator+
const getSessionSnapshots = async (req, res, next) => {
  try {
    const snapshots = await Snapshot.find({ sessionId: req.params.id }).sort({ frameNumber: 1 });
    res.status(200).json({ success: true, count: snapshots.length, snapshots });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/sessions/:id/analytics
// @access Operator+
const getSessionAnalytics = async (req, res, next) => {
  try {
    const sessions = await Session.find({ operatorId: req.user._id })
  .populate("operatorId", "name email role")  // ← add this
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const logs = await Log.find({ sessionId: req.params.id })
      .sort({ frameNumber: 1 })
      .select("frameNumber boxCount fps timestamp");

    if (!logs.length) {
      return res.status(200).json({ success: true, analytics: null, message: "No logs yet" });
    }

    const counts = logs.map((l) => l.boxCount);
    const peakCount = Math.max(...counts);
    const avgCount = parseFloat((counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2));

    // Count additions and removals
    let additions = 0;
    let removals = 0;
    for (let i = 1; i < counts.length; i++) {
      const diff = counts[i] - counts[i - 1];
      if (diff > 0) additions += diff;
      if (diff < 0) removals += Math.abs(diff);
    }

    // Chart data — sample every 10 frames to keep payload small
    const chartData = logs
      .filter((_, i) => i % 10 === 0)
      .map((l) => ({
        frame: l.frameNumber,
        count: l.boxCount,
        fps: l.fps,
        timestamp: l.timestamp,
      }));

    res.status(200).json({
      success: true,
      analytics: {
        peakCount,
        avgCount,
        totalAdditions: additions,
        totalRemovals: removals,
        totalFrames: logs.length,
        chartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  stopSession,
  getAllSessions,
  getMySessions,
  getSessionById,
  getSessionLogs,
  getSessionSnapshots,
  getSessionAnalytics,
};