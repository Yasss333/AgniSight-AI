import React, { useEffect, useState, useRef } from 'react';
import { sessionAPI } from '../services/api';
import { transformLogsToChartData, computeSummaryStats } from '../utils/chartHelpers';
import { SummaryCards } from '../components/SummaryCards';
import { CountChart } from '../components/CountChart';
import { VideoPlayer } from '../components/VideoPlayer';
import { useVideoSync } from '../hooks/useVideoSync';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';

export const Analytics = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [logs, setLogs] = useState([]);
  const [videoSrc, setVideoSrc] = useState('');
  const [loading, setLoading] = useState(true);
  
  const videoRef = useRef(null);
  const { seekToTimestamp } = useVideoSync(videoRef, logs);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchLogs(selectedSessionId);
    }
  }, [selectedSessionId]);

  const fetchSessions = async () => {
    try {
      const res = await sessionAPI.getSessions();
      setSessions(res.data || []);
      if (res.data?.length > 0) {
        setSelectedSessionId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (id) => {
    try {
      const res = await sessionAPI.getSessionLogs(id);
      setLogs(res.data.logs || []);
      const session = sessions.find(s => s.id === id);
      if (session?.videoPath) {
        setVideoSrc(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/${session.videoPath}`);
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const chartData = transformLogsToChartData(logs);
  const stats = computeSummaryStats(logs);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        
        <div className="w-full sm:w-64">
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.batchId || s.id.slice(0, 8)} - {new Date(s.createdAt).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SummaryCards stats={stats} />

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
            <VideoPlayer ref={videoRef} src={videoSrc} isLive={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
