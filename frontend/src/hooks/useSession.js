import { useState, useEffect } from 'react';
import { sessionAPI, videoAPI } from '../services/api';
import socket from '../services/socket';

export const useSession = () => {
  const [count,      setCount]      = useState(0);
  const [fps,        setFps]        = useState(0);
  const [isRunning,  setIsRunning]  = useState(false);
  const [sessionId,  setSessionId]  = useState(null);
  const [snapshots,  setSnapshots]  = useState([]);
  const [alerts,     setAlerts]     = useState([]);
  const [videoSrc,   setVideoSrc]   = useState(null);
  const [elapsed,    setElapsed]    = useState(0);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [videoPlaybackTime, setVideoPlaybackTime] = useState(0);
  const videoRef = { current: null };

  const setVideoRef = (ref) => {
    videoRef.current = ref;
  };

  const updateVideoPlaybackTime = (time) => {
    setVideoPlaybackTime(time);
  };
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, []);

  const startSession = async ({ conf, iou, file }) => {
    try {
      // 1. Create session
      const createRes = await sessionAPI.create({
        batchId:           `BATCH-${Date.now()}`,
        yoloConfThreshold: conf || 0.5,
        yoloIouThreshold:  iou  || 0.45,
      });
      const newSessionId = createRes.data.session._id;
      setSessionId(newSessionId);

      // 2. Upload video ONCE and set video source
      const uploadRes = await videoAPI.upload(newSessionId, file);
      const filename  = uploadRes.data.videoPath.split(/[/\\]/).pop();
      setVideoSrc(`http://localhost:5000/data/videos/${filename}`);

      // 3. Reset state (AFTER setting videoSrc — don't null it out)
      setIsRunning(true);
      setElapsed(0);
      setCount(0);
      setFps(0);
      setSnapshots([]);
      setAlerts([]);

      // 4. Start AI processing
      await videoAPI.process(newSessionId);

      // 5. Clean up old listeners BEFORE adding new ones
      socket.off("count_update");
      socket.off("snapshot_taken");
      socket.off("alert");
      socket.off("processing_done");
      socket.off("processing_error");
      socket.off("connect_error");

      // 6. Connect socket + join room
      socket.connect();
      socket.emit("join_session", newSessionId);

      // 7. Add fresh listeners
      socket.on("count_update", (data) => {
        setCount(data.count);
        setFps(data.fps);
      });

     socket.on("snapshot_taken", (data) => {
  setSnapshots((prev) => [{
    ...data,
    id: `${data.frame}-${Date.now()}`,  // ← unique key
    prevCount: data.previousCount || data.prev_count || 0,
    newCount:  data.new_count     || data.newCount   || 0,
    imagePath: data.imagePath     || data.image_path || '',
    timestamp: data.timestamp     || new Date(),
  }, ...prev].slice(0, 12));
});

      socket.on("alert", (data) => {
        setAlerts((prev) => [...prev, { ...data, id: Date.now() }]);
      });

      socket.on("processing_done", () => {
        setIsRunning(false);
        socket.emit("leave_session", newSessionId);
        socket.disconnect();
      });

      socket.on("processing_done", (data) => {
  setIsRunning(false);
  // Switch to annotated output video
  if (data.outputVideoPath) {
    const filename = data.outputVideoPath.split(/[/\\]/).pop();
    setVideoSrc(`http://localhost:5000/data/outputs/${filename}`);
  }
  socket.emit("leave_session", newSessionId);
  socket.disconnect();
});

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

    } catch (err) {
      console.error("Failed to start session:", err);
      // Auto-stop stuck active session
      if (err.response?.status === 400 && err.response?.data?.activeSessionId) {
        try {
          await sessionAPI.stopSession(err.response.data.activeSessionId);
        } catch (stopErr) {
          console.error("Failed to stop stuck session:", stopErr);
        }
      }
      setIsRunning(false);
    }
  };

  const stopSession = async () => {
    if (!sessionId) return;
    try {
      await sessionAPI.stopSession(sessionId);
      setIsRunning(false);
      socket.emit("leave_session", sessionId);
      socket.disconnect();
    } catch (err) {
      console.error("Failed to stop session:", err);
    }
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const sendAlert = async (type = "call", message) => {
    if (!sessionId) return;
    setIsSendingAlert(true);
    try {
      await sessionAPI.sendAlert(sessionId, { type, message });
    } catch (err) {
      console.error("Failed to send alert:", err);
    } finally {
      setIsSendingAlert(false);
    }
  };

  return {
    count, fps, elapsed,
    isRunning, snapshots, alerts,
    sessionId, videoSrc,
    startSession, stopSession, dismissAlert,
    sendAlert, isSendingAlert,
    setVideoRef, updateVideoPlaybackTime,
  };
};
