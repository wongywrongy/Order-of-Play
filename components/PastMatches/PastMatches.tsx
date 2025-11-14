'use client';

import { useApp } from '@/context/AppContext';
import { Match } from '@/types';

export function PastMatches() {
  const { matches } = useApp();
  const completedMatches = matches
    .filter((m) => m.status === 'completed')
    .sort((a, b) => {
      // Sort by endTime, most recent first
      if (!a.endTime && !b.endTime) return 0;
      if (!a.endTime) return 1;
      if (!b.endTime) return -1;
      return b.endTime.getTime() - a.endTime.getTime();
    });

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatScore = (match: Match) => {
    if (!match.score) return 'No score';
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
    return sets.join(', ') || 'No score';
  };

  const getMatchDisplay = (match: Match) => {
    const isDoubles = match.player3 && match.player4;
    if (isDoubles) {
      return (
        <div className="text-sm">
          <div>{match.player1.name} / {match.player3?.name || ''}</div>
          <div className="text-gray-600">{match.player2.name} / {match.player4?.name || ''}</div>
        </div>
      );
    }
    return (
      <div className="text-sm">
        <div>{match.player1.name}</div>
        <div className="text-gray-600">{match.player2.name}</div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Past Matches</h3>
      {completedMatches.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No completed matches yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {completedMatches.map((match) => (
            <div
              key={match.id}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {match.eventType}
                </span>
                {match.endTime && (
                  <span className="text-xs text-gray-500">
                    {formatDate(match.endTime)}
                  </span>
                )}
              </div>
              <div className="mb-2">
                {getMatchDisplay(match)}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Score: {formatScore(match)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

