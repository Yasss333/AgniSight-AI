import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';

export const CountOverlay = ({ count, fps, elapsed }) => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 300);
    return () => clearTimeout(timer);
  }, [count]);

  const fpsColor = fps >= 25 ? 'bg-green-500' : fps >= 15 ? 'bg-yellow-500' : 'bg-red-500';

  const formatElapsed = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-30 pointer-events-none">
      <div className={`px-4 py-2 rounded-lg backdrop-blur-md transition-colors duration-300 ${flash ? 'bg-amber-500/80 text-white' : 'bg-black/60 text-white'}`}>
        <div className="text-sm font-medium text-white/80 uppercase tracking-widest">Box Count</div>
        <div className="text-5xl font-mono font-bold">{count}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={`${fpsColor} text-white border-0 font-mono`}>
          {fps || 0} FPS
        </Badge>
        <Badge variant="outline" className="bg-black/50 text-white border-white/20 font-mono">
          ⏱ {formatElapsed(elapsed)}
        </Badge>
      </div>
    </div>
  );
};
