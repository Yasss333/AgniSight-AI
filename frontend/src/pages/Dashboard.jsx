import { useRef, useState } from 'react';
import { CountOverlay } from '../components/CountOverlay';
import { SessionControls } from '../components/SessionControls';
import { VideoPlayer } from '../components/VideoPlayer';
import { AlertBanner } from '../components/AlertBanner';
import { useSession } from '../hooks/useSession';
import { Button } from '../components/ui/button';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

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
    sendAlert,
    isSendingAlert,
    setVideoRef,
    updateVideoPlaybackTime,
  } = useSession();

  const videoRef = useRef(null);
  const [algorithmPaused, setAlgorithmPaused] = useState(false);

  const handleStart = (params) => {
    startSession(params);
  };

  const handleAlgorithmPlay = () => {
    setAlgorithmPaused(false);
    console.log('Algorithm resumed');
  };

  const handleAlgorithmPause = () => {
    setAlgorithmPaused(true);
    console.log('Algorithm paused');
  };

  const handleAlgorithmForward = () => {
    console.log('Algorithm: Skip forward');
  };

  const handleAlgorithmBackward = () => {
    console.log('Algorithm: Skip backward');
  };

  return (
    <div className="container mx-auto p-4 flex flex-col space-y-4 h-[calc(100vh-3.5rem)] relative">
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Live Dashboard</h1>
        <Button
          variant="destructive"
          onClick={() => sendAlert("call")}
          disabled={!isRunning || isSendingAlert}
        >
          {isSendingAlert ? "Sending Alert..." : "Send Alert"}
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col xl:flex-row gap-4 overflow-hidden">
        <div className="flex-[2] flex flex-col overflow-hidden">
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
      
        <div className="flex-1 bg-card rounded-lg border p-6 flex flex-col items-center justify-center gap-6">
          <h2 className="text-lg font-semibold">Algorithm Controls</h2>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <Button
              onClick={handleAlgorithmBackward}
              disabled={!isRunning}
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 h-24"
            >
              <SkipBack className="h-6 w-6" />
              <span className="text-xs">Backward</span>
            </Button>
            <Button
              onClick={handleAlgorithmPlay}
              disabled={!isRunning || !algorithmPaused}
              variant="default"
              className="flex flex-col items-center justify-center gap-2 h-24"
            >
              <Play className="h-6 w-6" />
              <span className="text-xs">Play</span>
            </Button>
            <Button
              onClick={handleAlgorithmPause}
              disabled={!isRunning || algorithmPaused}
              variant="default"
              className="flex flex-col items-center justify-center gap-2 h-24"
            >
              <Pause className="h-6 w-6" />
              <span className="text-xs">Pause</span>
            </Button>
            <Button
              onClick={handleAlgorithmForward}
              disabled={!isRunning}
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 h-24"
            >
              <SkipForward className="h-6 w-6" />
              <span className="text-xs">Forward</span>
            </Button>
          </div>
          <div className="text-sm text-muted-foreground text-center mt-4">
            {algorithmPaused ? 'Algorithm Paused' : 'Algorithm Running'}
          </div>
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
