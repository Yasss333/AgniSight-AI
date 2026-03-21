import React, { forwardRef } from 'react';
import { Skeleton } from './ui/skeleton';

export const VideoPlayer = forwardRef(({ src, isLive, isBuffering }, ref) => {
  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
      {isBuffering && !src && (
        <Skeleton className="w-full h-full absolute inset-0 rounded-none z-10" />
      )}
      {src ? (
        <video
          ref={ref}
          src={src}
          className="w-full h-full object-contain"
          controls
           autoPlay        // ← add this
           muted 
           loop={false}
          crossOrigin="anonymous"
          playsInline
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
