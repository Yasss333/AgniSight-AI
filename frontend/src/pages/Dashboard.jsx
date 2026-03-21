import { useRef, useEffect } from 'react';
import { CountOverlay } from '../components/CountOverlay';
import { SessionControls } from '../components/SessionControls';
import { VideoPlayer } from '../components/VideoPlayer';
import { AlertBanner } from '../components/AlertBanner';
import { useSession } from '../hooks/useSession';

export const Dashboard = () => {
  const {
    count,
    fps,
    elapsed,
    isRunning,
    alerts,
    videoSrc,
    startSession,
    stopSession,
    dismissAlert,
    setVideoRef,
    updateVideoPlaybackTime,
  } = useSession();

  const videoRef = useRef(null);

  const handleStart = (params) => {
    startSession(params);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col space-y-4 h-[calc(100vh-3.5rem)] relative">
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Live Dashboard</h1>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 bg-muted rounded-lg border relative overflow-hidden">
          <VideoPlayer 
            ref={videoRef}
            src={videoSrc}
            isLive={isRunning}
            isBuffering={false}
          />
          {isRunning && (
            <CountOverlay count={count} fps={fps} elapsed={elapsed} />
          )}
        </div>
      </div>

      <div className="h-24 bg-card rounded-lg border shadow-sm">
        <SessionControls
          onStart={handleStart}
          onStop={stopSession}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
};
