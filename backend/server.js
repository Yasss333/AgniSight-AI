require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { startCronJobs } = require("./services/videoService");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const errorMiddleware = require("./middleware/errorMiddleware");
const rateLimiter = require("./middleware/rateLimiter");

// Route imports
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const videoRoutes = require("./routes/videoRoutes");
const reportRoutes = require("./routes/reportRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();
const httpServer = http.createServer(app);
console.log("MONGO_URI:", process.env.MONGO_URI);
// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Make io accessible in routes/controllers
app.set("io", io);
app.use("/data/outputs", express.static(path.resolve("../data/outputs")));
app.use("/data/snapshots", express.static(path.resolve("../data/snapshots")));
// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(rateLimiter);

// Serve static files
app.use('/videos', express.static(path.join(__dirname, '../data/videos')));
app.use('/snapshots', express.static(path.join(__dirname, '../data/snapshots')));

// Connect DB
connectDB();

//CronJOBS
startCronJobs();
// const path = require("path");

// Serve static data files (videos, snapshots, reports)
app.use("/data/videos",    express.static(path.resolve("../data/videos")));
app.use("/data/outputs",   express.static(path.resolve("../data/outputs")));
app.use("/data/snapshots", express.static(path.resolve("../data/snapshots")));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/export", exportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Socket.io connection
io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on("join_session", (sessionId) => {
    socket.join(sessionId);
    logger.info(`Socket ${socket.id} joined session room: ${sessionId}`);
  });

  socket.on("leave_session", (sessionId) => {
    socket.leave(sessionId);
    logger.info(`Socket ${socket.id} left session room: ${sessionId}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Global error handler (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, io };