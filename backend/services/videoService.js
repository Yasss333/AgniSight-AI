const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const Session = require("../models/Session");
const logger = require("../utils/logger");

const deleteOldFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted old file: ${filePath}`);
      return true;
    }
  } catch (err) {
    logger.error(`Failed to delete file ${filePath}: ${err.message}`);
  }
  return false;
};

const cleanOldVideos = async () => {
  logger.info("Cron: Starting old video cleanup...");

  const retentionDays = parseInt(process.env.VIDEO_RETENTION_DAYS) || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    // Find sessions older than retention period that still have video paths
    const oldSessions = await Session.find({
      createdAt: { $lt: cutoffDate },
      $or: [
        { videoPath:       { $ne: null } },
        { outputVideoPath: { $ne: null } },
      ],
    });

    if (!oldSessions.length) {
      logger.info("Cron: No old videos to clean up.");
      return;
    }

    logger.info(`Cron: Found ${oldSessions.length} sessions with old videos.`);

    for (const session of oldSessions) {
      // Delete raw upload
      if (session.videoPath) {
        deleteOldFile(path.resolve(session.videoPath));
        session.videoPath = null;
      }

      // Delete processed output
      if (session.outputVideoPath) {
        deleteOldFile(path.resolve(session.outputVideoPath));
        session.outputVideoPath = null;
      }

      await session.save();
      logger.info(`Cron: Cleaned videos for session ${session._id}`);
    }

    logger.info(`Cron: Cleanup done. Processed ${oldSessions.length} sessions.`);
  } catch (err) {
    logger.error(`Cron: Cleanup failed: ${err.message}`);
  }
};

// Schedule: runs every day at midnight
const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("Cron: Midnight cleanup triggered.");
    await cleanOldVideos();
  });

  logger.info("Cron: Video cleanup job scheduled (daily at midnight).");
};

module.exports = { startCronJobs, cleanOldVideos };