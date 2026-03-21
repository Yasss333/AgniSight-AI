const { spawn } = require("child_process");
const path = require("path");
const Log = require("../models/Log");
const Snapshot = require("../models/Snapshot");
const Session = require("../models/Session");
const logger = require("../utils/logger");

// ═══════════════════════════════════════════════════════════════════════════════
// Global map to store active AI processes by session ID
// ═══════════════════════════════════════════════════════════════════════════════
const activeProcesses = new Map();

const runAI = (sessionId, videoPath, params, io) => {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || "python";
    const scriptPath = path.resolve(process.env.AI_SCRIPT_PATH || "../ai/main.py");
    const modelPath  = path.resolve(process.env.AI_MODEL_PATH  || "../ai/models/box_detection.pt")


    const args = [
      scriptPath,
      "--video", videoPath,
      "--session_id", sessionId.toString(),
      "--conf", params.yoloConfThreshold.toString(),
      "--iou", params.yoloIouThreshold.toString(),
      "--snapshot_dir", path.resolve(process.env.SNAPSHOT_DIR || "../data/snapshots"),
      "--output_dir", path.resolve(process.env.OUTPUT_DIR || "../data/outputs"),
        "--model",        modelPath,    
    ];

    logger.info(`Spawning AI process: ${pythonPath} ${args.join(" ")}`);

    const py = spawn(pythonPath, args);

    // ═══════════════════════════════════════════════════════════════════════════════
    // Store process reference for later termination
    // ═══════════════════════════════════════════════════════════════════════════════
    activeProcesses.set(sessionId.toString(), py);

    let buffer = "";

    py.stdout.on("data", async (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);

          if (parsed.type === "frame") {
            // Save log to DB
            await Log.create({
              sessionId,
              frameNumber: parsed.frame,
              boxCount: parsed.count,
              fps: parsed.fps,
              detections: parsed.detections || [],
              timestamp: new Date(),
            });

            // Emit live count update to frontend via socket room
            io.to(sessionId.toString()).emit("count_update", {
              sessionId,
              frame: parsed.frame,
              count: parsed.count,
              fps: parsed.fps,
              timestamp: new Date(),
            });
          }

          if (parsed.type === "snapshot") {
            // Save snapshot to DB
            await Snapshot.create({
              sessionId,
              frameNumber: parsed.frame,
              previousCount: parsed.prev_count,
              newCount: parsed.new_count,
              imagePath: parsed.image_path,
              timestamp: new Date(),
            });

            // Emit snapshot event to frontend
            io.to(sessionId.toString()).emit("snapshot_taken", {
              sessionId,
              frame: parsed.frame,
              previousCount: parsed.prev_count,
              newCount: parsed.new_count,
              imageUrl: `/snapshots/${path.basename(parsed.image_path)}`,
            });

            logger.info(`Snapshot saved: frame ${parsed.frame} | ${parsed.prev_count} → ${parsed.new_count}`);
          }

          if (parsed.type === "done") {
            logger.info(`AI process done for session ${sessionId} | Total frames: ${parsed.total_frames}`);

            // Update session with output video path
            await Session.findByIdAndUpdate(sessionId, {
              outputVideoPath: parsed.output_video_path || null,
              totalFrames: parsed.total_frames || 0,
            });

            io.to(sessionId.toString()).emit("processing_done", {
              sessionId,
              totalFrames: parsed.total_frames,
              outputVideoPath: parsed.output_video_path,
            });
          }

        } catch (err) {
          logger.error(`Failed to parse AI output line: ${line} | ${err.message}`);
        }
      }
    });

    py.stderr.on("data", (data) => {
      logger.error(`AI stderr: ${data.toString()}`);
    });

    py.on("close", (code) => {
      // ═══════════════════════════════════════════════════════════════════════════════
      // Clean up process reference
      // ═══════════════════════════════════════════════════════════════════════════════
      activeProcesses.delete(sessionId.toString());

      if (code === 0) {
        logger.info(`AI process exited cleanly for session ${sessionId}`);
        resolve();
      } else if (code === null) {
        // Process was killed (e.g., by SIGTERM)
        logger.info(`AI process was terminated for session ${sessionId}`);
        resolve();
      } else {
        logger.error(`AI process crashed with code ${code} for session ${sessionId}`);
        Session.findByIdAndUpdate(sessionId, { status: "failed" }).exec();
        io.to(sessionId.toString()).emit("processing_error", {
          sessionId,
          message: "AI processing failed. Check server logs.",
        });
        reject(new Error(`AI process exited with code ${code}`));
      }
    });

    py.on("error", (err) => {
      logger.error(`Failed to spawn AI process: ${err.message}`);
      activeProcesses.delete(sessionId.toString());
      reject(err);
    });
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// Stop AI processing for a session
// Kills the Python process and emits stop event
// ═══════════════════════════════════════════════════════════════════════════════
const stopAI = async (sessionId, io) => {
  const sessionIdStr = sessionId.toString();
  
  if (!activeProcesses.has(sessionIdStr)) {
    logger.warn(`No active AI process found for session ${sessionId}`);
    return false;
  }

  const py = activeProcesses.get(sessionIdStr);
  
  try {
    // Kill the process tree (child processes and parent)
    // On Windows, use SIGKILL; on Linux, use SIGTERM then SIGKILL
    if (process.platform === "win32") {
      // Windows: kill process tree
      require("child_process").exec(`taskkill /PID ${py.pid} /T /F`);
    } else {
      // Unix: try SIGTERM first, then SIGKILL
      py.kill("SIGTERM");
      setTimeout(() => {
        if (!py.killed) {
          py.kill("SIGKILL");
        }
      }, 500);
    }

    activeProcesses.delete(sessionIdStr);
    logger.info(`AI process stopped for session ${sessionId}`);

    // Notify connected clients
    if (io) {
      io.to(sessionIdStr).emit("processing_stopped", {
        sessionId,
        message: "AI processing stopped by user",
      });
    }

    return true;
  } catch (err) {
    logger.error(`Failed to stop AI process for session ${sessionId}: ${err.message}`);
    activeProcesses.delete(sessionIdStr);
    return false;
  }
};

module.exports = { runAI, stopAI };