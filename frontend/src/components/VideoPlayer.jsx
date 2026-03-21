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

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
      {src ? (
        <video
          ref={ref}
          src={src}
          className="w-full h-full object-contain"
          controls
          autoPlay
          muted
          loop={false}
          crossOrigin="anonymous"
          playsInline
          onLoadedData={handleLoadedData}
        />
      ) : (
        <div className="text-muted-foreground z-20">No active stream</div>
      )}
      {isLive && src && (
        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse z-30 tracking-wider">
          LIVE
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';