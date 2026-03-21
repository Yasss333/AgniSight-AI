const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: [true, "Batch ID is required"],
      trim: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed"],
      default: "active",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    finalBoxCount: {
      type: Number,
      default: 0,
    },
    videoPath: {
      type: String,
      default: null,
    },
    outputVideoPath: {
      type: String,
      default: null,
    },
    yoloConfThreshold: {
      type: Number,
      default: 0.5,
      min: 0.1,
      max: 1.0,
    },
    yoloIouThreshold: {
      type: Number,
      default: 0.45,
      min: 0.1,
      max: 1.0,
    },
    totalFrames: {
      type: Number,
      default: 0,
    },
    avgFps: {
      type: Number,
      default: 0,
    },
    reportPath: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);