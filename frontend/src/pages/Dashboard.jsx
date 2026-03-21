import { useRef } from 'react';
import { CountOverlay } from '../components/CountOverlay';
import { SessionControls } from '../components/SessionControls';
import { SnapshotGrid } from '../components/SnapshotGrid';
import { VideoPlayer } from '../components/VideoPlayer';
import { AlertBanner } from '../components/AlertBanner';
import { useSession } from '../hooks/useSession';

export const Dashboard = () => {
  const {
    count,
    fps,
    elapsed,
    isRunning,
    snapshots,
    alerts,
    videoSrc,
    startSession,
    stopSession,
    dismissAlert,
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
      
      <div className="flex-1 flex flex-col xl:flex-row gap-4 overflow-hidden">
        <div className="flex-[2] bg-muted rounded-lg border relative overflow-hidden">
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

        <div className="flex-1 min-w-[300px] h-full overflow-hidden">
          <SnapshotGrid snapshots={snapshots} />
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
