'use client';

import { useState, useEffect as ReactUseEffect } from 'react';
import React from 'react';
import { Match } from '@/types';
import { useApp } from '@/context/AppContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { highlightTextMultiple } from '@/components/utils/highlightText';
import { MatchEditModal } from './MatchEditModal';

type MatchQueueGridItemProps = {
  match: Match;
  conflicts: string[];
  position: number;
  searchQuery?: string;
};

export function MatchQueueGridItem({ match, conflicts, searchQuery = '' }: MatchQueueGridItemProps) {
  const { removeMatch, toggleCheckIn, updateMatchDetails, orderOfPlayCardHeight, matches } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Debug: log when match prop changes
  ReactUseEffect(() => {
    console.log('MatchQueueGridItem - match prop updated:', match.id, 'scheduledTime:', match.scheduledTime);
  }, [match]);
  
  // Get conflicting player IDs
  const getConflictingPlayerIds = () => {
    const conflictingIds = new Set<string>();
    const activeMatches = matches.filter((m) => m.status === 'active');
    
    const checkPlayer = (playerId: string) => {
      const isActive = activeMatches.some((m) => 
        m.player1.id === playerId ||
        m.player2.id === playerId ||
        m.player3?.id === playerId ||
        m.player4?.id === playerId
      );
      if (isActive) {
        conflictingIds.add(playerId);
      }
    };
    
    checkPlayer(match.player1.id);
    checkPlayer(match.player2.id);
    if (match.player3) checkPlayer(match.player3.id);
    if (match.player4) checkPlayer(match.player4.id);
    
    return conflictingIds;
  };
  
  const conflictingPlayerIds = getConflictingPlayerIds();
  const hasConflicts = conflictingPlayerIds.size > 0;
  const isDoubles = match.player3 && match.player4;
  const checkedIn = match.checkedIn || { player1: false, player2: false };
  const bothCheckedIn = checkedIn.player1 && checkedIn.player2;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: match.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, minHeight: `${orderOfPlayCardHeight}px`, height: `${orderOfPlayCardHeight}px` }}
      className={`relative p-1 border-2 rounded select-none flex flex-col ${
        hasConflicts
          ? 'bg-red-100 border-red-500'
          : bothCheckedIn
          ? 'bg-green-100 border-green-500'
          : 'bg-white border-gray-400 hover:border-gray-600'
      } ${isDragging ? 'z-50' : ''} ${isEditModalOpen ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      {...(isEditModalOpen ? {} : { ...attributes, ...listeners })}
      onMouseDown={(e) => {
        // Don't prevent default if clicking on edit/delete buttons
        const target = e.target as HTMLElement;
        if (target.closest('button')) {
          e.stopPropagation();
          return;
        }
        if (!isEditModalOpen) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex items-start justify-between mb-0.5">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="font-bold text-xs flex-shrink-0">#{match.matchNumber}</span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-1 py-0.5 rounded truncate">
            {highlightTextMultiple(match.eventType, searchQuery)}
          </span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsEditModalOpen(true);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="text-blue-600 hover:text-blue-800 text-xs leading-none p-0.5 cursor-pointer z-10 relative"
            title="Edit match"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const isDoubles = match.player3 && match.player4;
              const matchDescription = isDoubles
                ? `${match.eventType}: ${match.player1.name} / ${match.player3?.name} vs ${match.player2.name} / ${match.player4?.name}`
                : `${match.eventType}: ${match.player1.name} vs ${match.player2.name}`;
              
              if (window.confirm(`Are you sure you want to delete this match?\n\n${matchDescription}`)) {
                removeMatch(match.id);
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="text-red-600 hover:text-red-800 font-bold text-sm leading-none z-10 relative"
            title="Remove match"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-0 flex-1 min-h-0">
        {isDoubles ? (
          <>
            <p className={`font-semibold text-xs leading-tight break-words ${
              checkedIn.player1 ? 'text-green-700' : ''
            }`}>
              <span className={conflictingPlayerIds.has(match.player1.id) ? 'text-red-600' : ''}>
                {highlightTextMultiple(match.player1.name, searchQuery)}
              </span>
              {' / '}
              <span className={match.player3 && conflictingPlayerIds.has(match.player3.id) ? 'text-red-600' : ''}>
                {highlightTextMultiple(match.player3?.name || '', searchQuery)}
              </span>
            </p>
            <p className="text-xs text-gray-600 leading-tight">vs</p>
            <p className={`font-semibold text-xs leading-tight break-words ${
              checkedIn.player2 ? 'text-green-700' : ''
            }`}>
              <span className={conflictingPlayerIds.has(match.player2.id) ? 'text-red-600' : ''}>
                {highlightTextMultiple(match.player2.name, searchQuery)}
              </span>
              {' / '}
              <span className={match.player4 && conflictingPlayerIds.has(match.player4.id) ? 'text-red-600' : ''}>
                {highlightTextMultiple(match.player4?.name || '', searchQuery)}
              </span>
            </p>
          </>
        ) : (
          <>
            <p className={`font-semibold text-xs leading-tight break-words ${
              checkedIn.player1 ? 'text-green-700' : ''
            }`}>
              <span className={conflictingPlayerIds.has(match.player1.id) ? 'text-red-600' : ''}>
                {highlightTextMultiple(match.player1.name, searchQuery)}
              </span>
            </p>
            <p className="text-xs text-gray-600 leading-tight">vs</p>
            <p className={`font-semibold text-xs leading-tight break-words ${
              checkedIn.player2 ? 'text-green-700' : ''
            }`}>
              <span className={conflictingPlayerIds.has(match.player2.id) ? 'text-red-600' : ''}>
                {highlightTextMultiple(match.player2.name, searchQuery)}
              </span>
            </p>
          </>
        )}
      </div>

      <div className="mt-0.5 pt-0.5 border-t border-gray-200">
        <div className="text-xs text-gray-600 font-medium leading-tight mb-1">
          {match.scheduledTime ? (
            <span>{new Date(match.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          ) : (
            <span className="text-gray-400 italic">Match time: TBD</span>
          )}
          {/* Debug: scheduledTime={match.scheduledTime ? new Date(match.scheduledTime).toISOString() : 'null'} */}
        </div>
        {bothCheckedIn && !hasConflicts && (
          <p className="text-xs text-green-700 font-medium leading-tight mb-1">Ready</p>
        )}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCheckIn(match.id, 'player1');
            }}
            className={`flex-1 text-xs py-1 px-2 rounded border-2 transition-colors ${
              checkedIn.player1
                ? 'bg-green-500 border-green-600 text-white font-semibold'
                : 'bg-white border-gray-400 hover:border-gray-600 text-gray-700'
            }`}
            title={checkedIn.player1 ? 'Checked in' : 'Check in'}
          >
            {checkedIn.player1 ? '✓ Checked' : 'Check In'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCheckIn(match.id, 'player2');
            }}
            className={`flex-1 text-xs py-1 px-2 rounded border-2 transition-colors ${
              checkedIn.player2
                ? 'bg-green-500 border-green-600 text-white font-semibold'
                : 'bg-white border-gray-400 hover:border-gray-600 text-gray-700'
            }`}
            title={checkedIn.player2 ? 'Checked in' : 'Check in'}
          >
            {checkedIn.player2 ? '✓ Checked' : 'Check In'}
          </button>
        </div>
      </div>
      {isEditModalOpen && (
        <MatchEditModal
          key={match.id} // Only remount when match ID changes, not when scheduledTime changes
          match={match}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updates) => {
            console.log('MatchQueueGridItem onSave - updates:', updates);
            console.log('MatchQueueGridItem onSave - match.id:', match.id);
            updateMatchDetails(match.id, updates);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

