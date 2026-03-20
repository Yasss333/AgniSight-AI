const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    frameNumber: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    boxCount: {
      type: Number,
      required: true,
      min: 0,
    },
    fps: {
      type: Number,
      default: 0,
    },
    detections: [
      {
        trackId: Number,
        bbox: [Number],       // [x1, y1, x2, y2]
        confidence: Number,
      },
    ],
  },
  { timestamps: false }
);

module.exports = mongoose.model("Log", logSchema);