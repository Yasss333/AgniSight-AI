import React, { useEffect, useState, useRef } from 'react';
import { sessionAPI } from '../services/api';
import { transformLogsToChartData, computeSummaryStats } from '../utils/chartHelpers';
import { SummaryCards } from '../components/SummaryCards';
import { CountChart } from '../components/CountChart';
import { VideoPlayer } from '../components/VideoPlayer';
import { useVideoSync } from '../hooks/useVideoSync';
import { useSession } from '../hooks/useSession';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';

export const Analytics = () => {
  const { setVideoRef, updateVideoPlaybackTime } = useSession();
  const [sessions,         setSessions]         = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [logs,             setLogs]             = useState([]);
  const [videoSrc,         setVideoSrc]         = useState('');
  const [loading,          setLoading]          = useState(true);

  const videoRef = useRef(null);
  const { seekToTimestamp } = useVideoSync(videoRef, logs);

  useEffect(() => {
    setVideoRef(videoRef.current);
  }, [setVideoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      updateVideoPlaybackTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [updateVideoPlaybackTime]);

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    if (selectedSessionId) fetchLogs(selectedSessionId);
  }, [selectedSessionId]);

  const fetchSessions = async () => {
    try {
      const res = await sessionAPI.getMySessions();
      setSessions(res.data.sessions || []);
      if (res.data?.sessions?.length > 0) {
        setSelectedSessionId(res.data.sessions[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (id) => {
    if (!id) return;
    try {
      const res = await sessionAPI.getLogs(id);
      setLogs(res.data.logs || []);
      const session = sessions.find(s => s._id === id);
      if (session?.videoPath) {
        const filename = session.videoPath.split(/[/\\]/).pop();
        setVideoSrc(`http://localhost:5000/data/videos/${filename}`);
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
      setLogs([]);
    }
  };

  const chartData = transformLogsToChartData(logs);
  const stats     = computeSummaryStats(logs);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="flex items-center justify-center h-96 rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">No sessions found</p>
            <p className="text-sm text-muted-foreground mt-2">Start a new session to view analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">

      {/* Header + Session Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="w-full sm:w-64">
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(s => (
                <SelectItem key={s._id} value={s._id}>
                  {s.batchId || s._id.slice(0, 8)} — {new Date(s.createdAt).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={stats} />

      {/* Chart + Video */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CountChart data={chartData} onPointClick={seekToTimestamp} />
        </div>
        <div className="bg-muted rounded-lg border overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-card">
            <h3 className="text-sm font-medium">Session Playback</h3>
            <p className="text-xs text-muted-foreground">Click chart to seek</p>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            {videoSrc
              ? <VideoPlayer ref={videoRef} src={videoSrc} isLive={false} />
              : <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
                  Select a session to load video
                </div>
            }
          </div>
        </div>
      </div>

    </div>
  );
};
