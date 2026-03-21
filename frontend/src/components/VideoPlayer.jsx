import React, { forwardRef, useEffect, useRef } from 'react';

export const VideoPlayer = forwardRef(({ src, isLive, isBuffering }, ref) => {
  const timeRef = useRef(0);

  // Save current time before unmount
  useEffect(() => {
    const video = ref?.current;
    if (!video) return;
    const saveTime = () => { timeRef.current = video.currentTime; };
    video.addEventListener("timeupdate", saveTime);
    return () => video.removeEventListener("timeupdate", saveTime);
  }, [ref]);

  // Restore time after src loads
  const handleLoadedData = () => {
    if (ref?.current && timeRef.current > 0) {
      ref.current.currentTime = timeRef.current;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // Handle video end - auto-pause when video finishes
  // ═══════════════════════════════════════════════════════════════════════════════
  const handleEnded = () => {
    if (ref?.current) {
      ref.current.pause();
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
      {src ? (
        <video
          ref={ref}
          src={src}
          className="w-full h-full object-contain"
          controls
          autoPlay={false}
          muted
          loop={false}
          crossOrigin="anonymous"
          playsInline
          onLoadedData={handleLoadedData}
          onEnded={handleEnded}
        />
      ) : (
        <div className="text-muted-foreground z-20 text-center flex flex-col items-center gap-2">
          <div className="text-4xl">📹</div>
          <div>No video loaded</div>
          <div className="text-xs text-gray-400">Upload a video to start tracking</div>
        </div>
      )}
      {isLive && src && (
        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse z-30 tracking-wider shadow-lg">
          🔴 LIVE
        </div>
      )}
      {isBuffering && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="text-white text-center">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <div className="text-sm">Processing frames...</div>
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
