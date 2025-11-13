'use client';

import { useState, useEffect } from 'react';

type EmptyCourtTimerProps = {
  emptySince: Date;
};

export function EmptyCourtTimer({ emptySince }: EmptyCourtTimerProps) {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      const elapsedMs = now - emptySince.getTime();
      setElapsed(Math.max(0, elapsedMs));
    };

    // Update immediately
    updateElapsed();

    // Update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [emptySince]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 flex items-center gap-1">
      <span className="text-xs font-semibold text-gray-600">Empty:</span>
      <span className="text-xs font-bold text-gray-700">{formatTime(elapsed)}</span>
    </div>
  );
}

