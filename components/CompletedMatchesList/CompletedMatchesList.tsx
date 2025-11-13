'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Match } from '@/types';
import { highlightTextMultiple } from '@/components/utils/highlightText';
import { ScoreModal } from '@/components/CourtGrid/ScoreModal';

export function CompletedMatchesList() {
  const { matches, updateMatchScore } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  
  const completedMatches = matches
    .filter((m) => m.status === 'completed')
    .filter((m) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const isDoubles = m.player3 && m.player4;
      const player1Name = m.player1.name.toLowerCase();
      const player2Name = m.player2.name.toLowerCase();
      const player3Name = m.player3?.name.toLowerCase() || '';
      const player4Name = m.player4?.name.toLowerCase() || '';
      const eventType = m.eventType.toLowerCase();
      return (
        player1Name.includes(query) ||
        player2Name.includes(query) ||
        player3Name.includes(query) ||
        player4Name.includes(query) ||
        eventType.includes(query)
      );
    })
    .sort((a, b) => {
      // Sort by endTime, most recent first
      if (!a.endTime && !b.endTime) return 0;
      if (!a.endTime) return 1;
      if (!b.endTime) return -1;
      return b.endTime.getTime() - a.endTime.getTime();
    })
    .slice(0, 20); // Show up to 20 matches

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getMatchDuration = (match: Match) => {
    if (!match.startTime || !match.endTime) return '';
    const duration = match.endTime.getTime() - match.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMatchTime = (match: Match) => {
    // Use scheduledTime as the match time (when the match was scheduled to be played)
    if (match.scheduledTime) {
      return formatTime(match.scheduledTime);
    }
    // Fall back to warmupStartTime if scheduledTime is not available
    if (match.warmupStartTime) {
      return formatTime(match.warmupStartTime);
    }
    // Fall back to startTime if neither is available
    if (match.startTime) {
      return formatTime(match.startTime);
    }
    return '';
  };

  const getWinner = (match: Match) => {
    if (!match.score) return null;
    
    let player1Wins = 0;
    let player2Wins = 0;
    
    if (match.score.set1) {
      const p1 = match.score.set1.player1;
      const p2 = match.score.set1.player2;
      if (p1 >= 21 && (p1 === 30 || p1 - p2 >= 2)) player1Wins++;
      else if (p2 >= 21 && (p2 === 30 || p2 - p1 >= 2)) player2Wins++;
    }
    if (match.score.set2) {
      const p1 = match.score.set2.player1;
      const p2 = match.score.set2.player2;
      if (p1 >= 21 && (p1 === 30 || p1 - p2 >= 2)) player1Wins++;
      else if (p2 >= 21 && (p2 === 30 || p2 - p1 >= 2)) player2Wins++;
    }
    if (match.score.set3) {
      const p1 = match.score.set3.player1;
      const p2 = match.score.set3.player2;
      if (p1 >= 21 && (p1 === 30 || p1 - p2 >= 2)) player1Wins++;
      else if (p2 >= 21 && (p2 === 30 || p2 - p1 >= 2)) player2Wins++;
    }
    
    if (player1Wins >= 2) return 'player1';
    if (player2Wins >= 2) return 'player2';
    return null;
  };

  const formatScore = (match: Match) => {
    if (!match.score) return '';
    const sets: string[] = [];
    if (match.score.set1) {
      sets.push(`${match.score.set1.player1}-${match.score.set1.player2}`);
    }
    if (match.score.set2) {
      sets.push(`${match.score.set2.player1}-${match.score.set2.player2}`);
    }
    if (match.score.set3) {
      sets.push(`${match.score.set3.player1}-${match.score.set3.player2}`);
    }
    return sets.join(', ');
  };

  const getMatchDisplay = (match: Match) => {
    const isDoubles = match.player3 && match.player4;
    const winner = getWinner(match);
    
    if (isDoubles) {
      return (
        <>
          <div className={winner === 'player1' ? 'font-bold text-green-700' : ''}>
            {highlightTextMultiple(match.player1.name, searchQuery)} / {highlightTextMultiple(match.player3?.name || '', searchQuery)}
          </div>
          <div className={winner === 'player2' ? 'font-bold text-green-700' : ''}>
            {highlightTextMultiple(match.player2.name, searchQuery)} / {highlightTextMultiple(match.player4?.name || '', searchQuery)}
          </div>
        </>
      );
    }
    return (
      <>
        <div className={winner === 'player1' ? 'font-bold text-green-700' : ''}>
          {highlightTextMultiple(match.player1.name, searchQuery)}
        </div>
        <div className={winner === 'player2' ? 'font-bold text-green-700' : ''}>
          {highlightTextMultiple(match.player2.name, searchQuery)}
        </div>
      </>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="flex-shrink-0 p-2 border-b border-gray-200">
        <h3 className="text-xs font-bold text-gray-700 mb-1.5">Completed Matches</h3>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {completedMatches.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-4">
            {searchQuery ? 'No matches found' : 'No completed matches'}
          </p>
        ) : (
          <div className="space-y-1.5">
            {completedMatches.map((match) => (
              <div
                key={match.id}
                className="border border-gray-200 rounded p-1.5 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-1 py-0.5 rounded">
                    {highlightTextMultiple(match.eventType, searchQuery)}
                  </span>
                  <div className="flex flex-col items-end gap-0.5">
                    {getMatchTime(match) && (
                      <div className="text-xs text-gray-500">
                        <span className="text-gray-400">match time </span>
                        <span>{getMatchTime(match)}</span>
                      </div>
                    )}
                    {match.endTime && (
                      <div className="text-xs text-gray-500">
                        <span className="text-gray-400">called at </span>
                        <span>{formatTime(match.endTime)}</span>
                      </div>
                    )}
                    {getMatchDuration(match) && (
                      <div className="text-xs text-gray-600 font-medium">
                        <span className="text-gray-500">duration </span>
                        <span>{getMatchDuration(match)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-700 mb-1 leading-tight space-y-0.5">
                  {getMatchDisplay(match)}
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  {match.score && (
                    <div className="text-xs text-gray-600 font-medium flex-1">
                      {formatScore(match)}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMatchId(match.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs leading-none p-0.5 flex-shrink-0"
                    title="Edit score"
                  >
                    ✏️
                  </button>
                </div>
                {editingMatchId === match.id && (
                  <ScoreModal
                    match={match}
                    isOpen={true}
                    onClose={() => setEditingMatchId(null)}
                    onSave={(score) => {
                      updateMatchScore(match.id, score);
                      setEditingMatchId(null);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

