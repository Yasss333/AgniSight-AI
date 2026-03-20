import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { sessionAPI, videoAPI } from '../services/api';

export const useSession = () => {
  const { token } = useAuth();
  const [count, setCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [videoSrc, setVideoSrc] = useState(null);
  const eventSourceRef = useRef(null);
  const startTimerRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startSession = async ({ conf, iou, file }) => {
    try {
      // 1. Upload video
      const formData = new FormData();
      formData.append('video', file);
      const uploadRes = await videoAPI.uploadVideo(formData);
      const videoPath = uploadRes.data.path;
      setVideoSrc(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/${videoPath}`);

      // 2. Start session
      const res = await sessionAPI.startSession({ conf, iou, videoPath });
      const newSessionId = res.data.sessionId;
      
      setSessionId(newSessionId);
      setIsRunning(true);
      setElapsed(0);
      setCount(0);
      setFps(0);
      setSnapshots([]);
      setAlerts([]);

      // 3. Connect SSE
      const sseUrl = `${import.meta.env.VITE_SSE_BASE_URL}/video/stream/${newSessionId}?token=${token}`;
      eventSourceRef.current = new EventSource(sseUrl);

      eventSourceRef.current.addEventListener('count_update', (e) => {
        const data = JSON.parse(e.data);
        setCount(data.count);
        setFps(data.fps);
      });

      eventSourceRef.current.addEventListener('snapshot', (e) => {
        const data = JSON.parse(e.data);
        setSnapshots((prev) => {
          const updated = [data, ...prev];
          const max = parseInt(import.meta.env.VITE_MAX_SNAPSHOTS || '12', 10);
          return updated.slice(0, max);
        });
      });

      eventSourceRef.current.addEventListener('anomaly_alert', (e) => {
        const data = JSON.parse(e.data);
        setAlerts((prev) => [...prev, data]);
      });

      eventSourceRef.current.addEventListener('session_end', (e) => {
        const data = JSON.parse(e.data);
        setIsRunning(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      });

      eventSourceRef.current.onerror = (err) => {
        console.error('SSE Error', err);
        // Retries could be implemented here
      };

    } catch (err) {
      console.error('Failed to start session', err);
    }
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter(a => a.id !== id));
  };

  const stopSession = async () => {
    if (!sessionId) return;
    try {
      await sessionAPI.stopSession(sessionId);
      setIsRunning(false);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    } catch (err) {
      console.error('Failed to stop session', err);
    }
  };

  return {
    count,
    fps,
    elapsed,
    isRunning,
    snapshots,
    alerts,
    sessionId,
    videoSrc,
    startSession,
    stopSession,
    dismissAlert
  };
};
