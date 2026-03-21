import { useCallback } from 'react';

export const useVideoSync = (videoRef, sessionLogs) => {
  const seekToTimestamp = useCallback(
    (targetSeconds) => {
      if (!videoRef.current) return;
      
      const duration = videoRef.current.duration;
      if (isNaN(duration)) return; // Video not loaded fully
      
      // Ensure we don't seek beyond valid bounds
      const safeTime = Math.max(0, Math.min(targetSeconds, duration));
      videoRef.current.currentTime = safeTime;
    },
    [videoRef]
  );

  return { seekToTimestamp };
};
