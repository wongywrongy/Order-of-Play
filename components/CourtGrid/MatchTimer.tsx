'use client';

import { useEffect, useState } from 'react';
import { Match } from '@/types';
import { useApp } from '@/context/AppContext';

type MatchTimerProps = {
  match: Match;
  onWarmupEnd: () => void;
  onPauseToggle: () => void;
  onEndEarly: () => void;
  onFlashChange?: (isFlashing: boolean) => void;
  onGreenFlash?: () => void;
};

export function MatchTimer({ match, onWarmupEnd, onPauseToggle, onEndEarly, onFlashChange, onGreenFlash }: MatchTimerProps) {
  const { warmupTimeSeconds, warmupFlashSeconds } = useApp();
  const [warmupElapsed, setWarmupElapsed] = useState<number>(0);
  const [matchElapsed, setMatchElapsed] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [wasInWarmup, setWasInWarmup] = useState<boolean>(false);

  useEffect(() => {
    if (!match.warmupStartTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const pausedTime = match.pausedDuration || 0;
      
      // Calculate warmup elapsed time using configured warmup time in seconds
      const warmupDuration = warmupTimeSeconds * 1000;
      
      // If match timer has started, show match time
      if (match.matchStartTime) {
        if (match.timerPaused) {
          // If paused, don't update the elapsed time
          // Keep the current elapsed time
        } else {
          // Calculate match elapsed time
          // pausedDuration now only tracks match paused time (reset when match starts)
          const matchStart = match.matchStartTime.getTime();
          let elapsed = now - matchStart;
          
          // Subtract any accumulated paused duration (match paused time only)
          elapsed -= (match.pausedDuration || 0);
          
          setMatchElapsed(Math.max(0, elapsed));
        }
        
        setWarmupElapsed(warmupDuration);
        setIsFlashing(false);
        if (onFlashChange) {
          onFlashChange(false);
        }
        // Reset warmup tracking
        if (wasInWarmup) {
          setWasInWarmup(false);
        }
      } else {
        // Still in warmup
        if (match.timerPaused) {
          // Don't update if paused
          return;
        }
        
        const elapsed = now - match.warmupStartTime!.getTime() - pausedTime;
        const remaining = warmupDuration - elapsed;
        
        setWarmupElapsed(Math.max(0, elapsed));
        setMatchElapsed(0);
        
        // Track if we were in warmup
        if (remaining > 0) {
          setWasInWarmup(true);
        }
        
        // Flash red in last N seconds (configurable)
        const flashDuration = warmupFlashSeconds * 1000;
        const shouldFlash = remaining <= flashDuration && remaining > 0;
        setIsFlashing(shouldFlash);
        if (onFlashChange) {
          onFlashChange(shouldFlash);
        }
        
        // Check if warmup just ended (remaining <= 0 but match hasn't started yet)
        if (remaining <= 0 && wasInWarmup) {
          if (onGreenFlash) {
            onGreenFlash();
          }
          setWasInWarmup(false);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [match.warmupStartTime, match.matchStartTime, match.timerPaused, match.pausedDuration, match.lastPauseTime, warmupTimeSeconds, warmupFlashSeconds, onFlashChange, onGreenFlash]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const warmupRemaining = warmupTimeSeconds * 1000 - warmupElapsed;
  const isWarmup = warmupRemaining > 0 && !match.matchStartTime;

  if (!match.warmupStartTime) return null;

  return (
    <div className="flex items-center gap-1">
      {isWarmup ? (
        <div 
          className={`border rounded px-1.5 py-0.5 flex items-center gap-1 transition-colors ${
            isFlashing 
              ? 'bg-red-500 border-red-600 animate-pulse' 
              : 'bg-yellow-50 border-yellow-300'
          }`}
        >
          <span className={`text-xs font-semibold ${isFlashing ? 'text-white' : 'text-yellow-800'}`}>W</span>
          <span className={`text-xs font-bold ${isFlashing ? 'text-white' : 'text-yellow-900'}`}>
            {formatTime(warmupRemaining)}
          </span>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-300 rounded px-1.5 py-0.5 flex items-center gap-1">
          <span className="text-xs font-semibold text-green-800">M</span>
          <span className="text-xs font-bold text-green-900">{formatTime(matchElapsed)}</span>
        </div>
      )}
      {match.timerPaused && (
        <span className="text-xs text-gray-500">⏸</span>
      )}
      <div className="flex items-center gap-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPauseToggle();
          }}
          className="text-xs px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
          title={match.timerPaused ? 'Resume' : 'Pause'}
        >
          {match.timerPaused ? '▶' : '⏸'}
        </button>
        {isWarmup && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWarmupEnd();
            }}
            className={`text-xs px-1 py-0.5 rounded transition-colors ${
              isFlashing
                ? 'bg-red-600 hover:bg-red-700 text-white font-bold'
                : 'bg-blue-200 hover:bg-blue-300'
            }`}
            title="Start match"
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
}

