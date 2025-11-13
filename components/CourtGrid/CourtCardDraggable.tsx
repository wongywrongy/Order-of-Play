'use client';

import { useState, useEffect } from 'react';
import { Court } from '@/types';
import { useApp } from '@/context/AppContext';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MatchTimer } from './MatchTimer';
import { ScoreInput } from './ScoreInput';
import { EmptyCourtTimer } from './EmptyCourtTimer';

type CourtCardDraggableProps = {
  court: Court;
  isEditMode: boolean;
};

export function CourtCardDraggable({ court, isEditMode }: CourtCardDraggableProps) {
  const { startMatch, completeMatch, matches, assignMatchToCourt, startMatchTimer, updateMatchScore, updateCourtName, toggleTimerPause, removeMatchFromCourt } = useApp();
  const [isEditingName, setIsEditingName] = useState(false);
  const [courtName, setCourtName] = useState(court.name);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isGreenFlash, setIsGreenFlash] = useState(false);
  const availableMatches = matches.filter((m) => m.status === 'pending');

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: court.id,
    disabled: !isEditMode,
  });

  // Create a drag handle to prevent text selection issues
  const dragHandleProps = isEditMode ? {
    ...attributes,
    ...listeners,
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      if (listeners?.onPointerDown) {
        listeners.onPointerDown(e as any);
      }
    },
  } : {};

  const {
    setNodeRef: setDropRef,
    isOver,
  } = useDroppable({
    id: `court-drop-${court.id}`,
    disabled: isEditMode || !!court.currentMatch,
  });

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  // Court representation - scales with grid size for desktop readability
  // Badminton court is roughly 13.4m x 6.1m (length x width)
  // Landscape orientation: wider than tall (8 cols × 4 rows)
  // Use most of the grid space with padding for text readability
  const courtStyle = {
    ...dragStyle,
    aspectRatio: '13.4 / 6.1', // Keep aspect ratio for consistent sizing
    width: '100%', // Full width of grid cell (8 cols = 240px)
    height: '100%', // Full height of grid cell (4 rows = 120px)
    margin: '0', // No margin for perfect alignment
    padding: '4px', // Minimal padding
    userSelect: 'none' as const,
    position: 'relative' as const,
    boxSizing: 'border-box' as const,
    minWidth: '0', // Allow flex shrinking
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden' as const, // Hide overflow to keep clean
  };

  const handleStartMatch = (matchId: string) => {
    startMatch(matchId, court.id);
  };

  const handleCompleteMatch = () => {
    if (court.currentMatch) {
      completeMatch(court.currentMatch.id);
    }
  };

  // Sync court name with prop changes
  useEffect(() => {
    setCourtName(court.name);
  }, [court.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourtName(e.target.value);
  };

  const handleNameBlur = () => {
    if (courtName.trim() && courtName !== court.name) {
      updateCourtName(court.id, courtName.trim());
    } else {
      setCourtName(court.name); // Reset if empty or unchanged
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setCourtName(court.name);
      setIsEditingName(false);
    }
  };

  const getMatchDisplay = () => {
    if (!court.currentMatch) return null;
    const m = court.currentMatch;
    const isDoubles = m.player3 && m.player4;
    
    return (
      <div className="space-y-0.5">
        {isDoubles ? (
          <>
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-semibold" style={{ fontSize: '9px' }}>
                {m.player1.name} / {m.player3.name}
              </span>
            </div>
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-semibold" style={{ fontSize: '9px' }}>
                {m.player2.name} / {m.player4.name}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-semibold" style={{ fontSize: '9px' }}>{m.player1.name}</span>
            </div>
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-semibold" style={{ fontSize: '9px' }}>{m.player2.name}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
      }}
      style={courtStyle}
      className={`border-2 rounded p-2 shadow relative select-none transition-colors ${
        isGreenFlash && court.currentMatch
          ? 'border-green-500 bg-green-200 animate-pulse'
          : isFlashing && court.currentMatch
          ? 'border-red-500 bg-red-100 animate-pulse'
          : isEditMode
          ? 'border-gray-400 bg-white cursor-grab active:cursor-grabbing'
          : isOver
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 bg-white cursor-default'
      } ${isDragging ? 'z-50 shadow-2xl' : ''} ${isOver ? 'ring-2 ring-green-400' : ''}`}
      {...dragHandleProps}
    >
      {court.currentMatch ? (
        <div className="flex flex-col h-full">
          {/* Header: Court name and timer in one row */}
          <div className="flex items-center justify-between mb-1">
            {isEditMode && isEditingName ? (
              <input
                type="text"
                value={courtName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                className="font-bold flex-1 border-2 border-blue-500 rounded px-1 py-0.5"
                style={{ fontSize: '12px' }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 
                className="font-bold cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors flex-1" 
                style={{ fontSize: '12px' }}
                onClick={(e) => {
                  if (isEditMode) {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }
                }}
                title={isEditMode ? 'Click to rename' : ''}
              >
                {court.name}
              </h3>
            )}
            <div className="ml-2 flex-shrink-0">
              <MatchTimer 
                match={court.currentMatch} 
                onWarmupEnd={() => startMatchTimer(court.currentMatch!.id)}
                onPauseToggle={() => toggleTimerPause(court.currentMatch!.id)}
                onEndEarly={() => startMatchTimer(court.currentMatch!.id)}
                onFlashChange={setIsFlashing}
                onGreenFlash={() => {
                  setIsGreenFlash(true);
                  setTimeout(() => setIsGreenFlash(false), 1000); // Flash green for 1 second
                }}
              />
            </div>
          </div>
          
          {/* Match info: Event type and players inline */}
          <div className="bg-blue-50 px-1.5 py-1 rounded border border-blue-200 mb-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-blue-900" style={{ fontSize: '10px' }}>
                #{court.currentMatch.matchNumber}
              </span>
              <span className="font-semibold text-blue-700" style={{ fontSize: '10px' }}>
                {court.currentMatch.eventType}
              </span>
              {court.currentMatch.score && (
                <div className="flex items-center gap-0.5 bg-gray-100 rounded px-1.5 py-1">
                  <span className="font-bold" style={{ fontSize: '11px' }}>
                    {(() => {
                      const sets = [];
                      if (court.currentMatch.score?.set1) sets.push(`${court.currentMatch.score.set1.player1}-${court.currentMatch.score.set1.player2}`);
                      if (court.currentMatch.score?.set2) sets.push(`${court.currentMatch.score.set2.player1}-${court.currentMatch.score.set2.player2}`);
                      if (court.currentMatch.score?.set3) sets.push(`${court.currentMatch.score.set3.player1}-${court.currentMatch.score.set3.player2}`);
                      return sets.join(', ');
                    })()}
                  </span>
                </div>
              )}
            </div>
            {getMatchDisplay()}
          </div>
          
              {/* Undo and Complete buttons */}
              <div className="flex gap-1 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (court.currentMatch) {
                      const isDoubles = court.currentMatch.player3 && court.currentMatch.player4;
                      const matchDescription = isDoubles
                        ? `${court.currentMatch.eventType}: ${court.currentMatch.player1.name} / ${court.currentMatch.player3?.name} vs ${court.currentMatch.player2.name} / ${court.currentMatch.player4?.name}`
                        : `${court.currentMatch.eventType}: ${court.currentMatch.player1.name} vs ${court.currentMatch.player2.name}`;
                      
                      if (window.confirm(`Are you sure you want to return this match to the order of play?\n\n${matchDescription}`)) {
                        removeMatchFromCourt(court.currentMatch.id);
                      }
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded transition-colors flex-shrink-0"
                  style={{ fontSize: '10px' }}
                  title="Return match to order of play"
                >
                  ↶ Undo
                </button>
                <div className="flex-1">
                  <ScoreInput 
                    match={court.currentMatch}
                    onScoreUpdate={(score) => {
                      updateMatchScore(court.currentMatch!.id, score);
                      // Complete the match after score is saved
                      handleCompleteMatch();
                    }}
                    showAsButton={true}
                  />
                </div>
              </div>
        </div>
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between">
            <div className="flex-1">
              {isEditMode && isEditingName ? (
                <input
                  type="text"
                  value={courtName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  className="font-bold w-full border-2 border-blue-500 rounded px-2 py-1"
                  style={{ fontSize: '14px' }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ) : (
                <h3 
                  className="font-bold cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors" 
                  style={{ fontSize: '14px' }}
                  onClick={(e) => {
                    if (isEditMode) {
                      e.stopPropagation();
                      setIsEditingName(true);
                    }
                  }}
                  title={isEditMode ? 'Click to rename' : ''}
                >
                  {court.name}
                </h3>
              )}
            </div>
            {court.emptySince && (
              <div className="ml-2 flex-shrink-0">
                <EmptyCourtTimer emptySince={court.emptySince} />
              </div>
            )}
          </div>
          <div className="space-y-2.5">
            <p className="text-gray-500" style={{ fontSize: '12px' }}>Available</p>
            {!isEditMode && availableMatches.length > 0 && (
              <p className="text-green-600 font-medium" style={{ fontSize: '12px' }}>
                Drop match here
              </p>
            )}
            {isEditMode && availableMatches.length > 0 && (
              <select
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (e.target.value) {
                    handleStartMatch(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full border border-gray-300 rounded px-2 py-2"
                style={{ fontSize: '12px' }}
                defaultValue=""
              >
                <option value="">Select match...</option>
                {availableMatches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.eventType}: {match.player1.name} vs {match.player2.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </>
      )}
    </div>
  );
}
