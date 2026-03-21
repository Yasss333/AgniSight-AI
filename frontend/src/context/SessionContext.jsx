import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { sessionAPI, videoAPI } from '../services/api';
import socket from '../services/socket';
const SessionContext = createContext(null);
import { useAuth } from '../hooks/useAuth';


export const SessionProvider = ({ children }) => {
    const { registerStopSession } = useAuth();
  const [count,      setCount]      = useState(0);
  const [fps,        setFps]        = useState(0);
  const [isRunning,  setIsRunning]  = useState(false);
  const [sessionId,  setSessionId]  = useState(null);
  const [alerts,     setAlerts]     = useState([]);
  const [videoSrc,   setVideoSrc]   = useState(null);
  const [elapsed,    setElapsed]    = useState(0);
  const [videoPlaybackTime, setVideoPlaybackTime] = useState(0);
  const videoRef = useRef(null);

  // Elapsed timer
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);
   useEffect(() => {
  registerStopSession(stopSession);
}, []);
  const startSession = async ({ conf, iou, file }) => {
    try {
      const createRes = await sessionAPI.create({
        batchId:           `BATCH-${Date.now()}`,
        yoloConfThreshold: conf || 0.25,
        yoloIouThreshold:  iou  || 0.30,
      });
      const newSessionId = createRes.data.session._id;
      setSessionId(newSessionId);

      const uploadRes = await videoAPI.upload(newSessionId, file);
      const filename  = uploadRes.data.videoPath.split(/[/\\]/).pop();
      setVideoSrc(`http://localhost:5000/data/videos/${filename}`);

      setIsRunning(true);
      setElapsed(0);
      setCount(0);
      setFps(0);
      setAlerts([]);

      await videoAPI.process(newSessionId);

      socket.off("count_update");
      socket.off("alert");
      socket.off("processing_done");
      socket.off("processing_error");
      socket.off("processing_stopped");

      socket.connect();
      socket.emit("join_session", newSessionId);

      socket.on("count_update", (data) => {
        setCount(data.count);
        setFps(data.fps);
      });

      socket.on("alert", (data) => {
        setAlerts((prev) => [...prev, { ...data, id: Date.now() }]);
      });

      socket.on("processing_done", (data) => {
        setIsRunning(false);
        if (data?.outputVideoPath) {
          const fname = data.outputVideoPath.split(/[/\\]/).pop();
          setVideoSrc(`http://localhost:5000/data/outputs/${fname}`);
        }
        socket.emit("leave_session", newSessionId);
        socket.disconnect();
      });

      // Handle processing stopped event (when user stops video)
      socket.on("processing_stopped", (data) => {
        setIsRunning(false);
        console.log("Processing stopped:", data.message);
      });

      socket.on("processing_error", (data) => {
        console.error("Processing error:", data.message);
        setIsRunning(false);
        socket.disconnect();
      });

    } catch (err) {
      console.error("Failed to start session:", err);
      if (err.response?.status === 400 && err.response?.data?.activeSessionId) {
        try {
          await sessionAPI.stopSession(err.response.data.activeSessionId);
        } catch (e) {
          console.error("Failed to stop stuck session:", e);
        }
      }
      setIsRunning(false);
    }
  };

  const stopSession = async () => {
    if (!sessionId) return;
    try {
      // Stop the AI processing first (kills Python process)
      await videoAPI.stop(sessionId);
      
      // Then stop the session in database
      await sessionAPI.stopSession(sessionId);
      
      setIsRunning(false);
      socket.emit("leave_session", sessionId);
      socket.disconnect();
      setSessionId(null);
    } catch (err) {
      console.error("Failed to stop session:", err);
      setIsRunning(false);
    }
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const updateVideoPlaybackTime = (time) => {
    setVideoPlaybackTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const setVideoRef = (ref) => {
    videoRef.current = ref;
    // Restore playback time when video is attached
    if (ref && videoPlaybackTime > 0) {
      ref.currentTime = videoPlaybackTime;
    }
  };

  return (
    <SessionContext.Provider value={{
      count, fps, elapsed,
      isRunning, alerts,
      sessionId, videoSrc,
      videoRef, videoPlaybackTime,
      startSession, stopSession, dismissAlert,
      updateVideoPlaybackTime, setVideoRef,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
};