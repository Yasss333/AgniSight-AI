const mongoose = require("mongoose");

const snapshotSchema = new mongoose.Schema(
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
    previousCount: {
      type: Number,
      required: true,
    },
    newCount: {
      type: Number,
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Snapshot", snapshotSchema);