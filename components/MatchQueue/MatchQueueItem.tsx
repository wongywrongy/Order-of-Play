'use client';

import { Match } from '@/types';
import { useApp } from '@/context/AppContext';

type MatchQueueItemProps = {
  match: Match;
  conflicts: string[];
};

export function MatchQueueItem({ match, conflicts }: MatchQueueItemProps) {
  const { removeMatch } = useApp();
  const hasConflicts = conflicts.length > 0;

  return (
    <div
      className={`p-3 rounded border-2 transition-colors ${
        hasConflicts
          ? 'bg-red-50 border-red-300'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">
            {match.player1.name} vs {match.player2.name}
          </p>
          {hasConflicts && (
            <div className="mt-1">
              {conflicts.map((conflict, idx) => (
                <p key={idx} className="text-sm text-red-600 font-medium">
                  ⚠️ {conflict}
                </p>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            const isDoubles = match.player3 && match.player4;
            const matchDescription = isDoubles
              ? `${match.eventType}: ${match.player1.name} / ${match.player3?.name} vs ${match.player2.name} / ${match.player4?.name}`
              : `${match.eventType}: ${match.player1.name} vs ${match.player2.name}`;
            
            if (window.confirm(`Are you sure you want to delete this match?\n\n${matchDescription}`)) {
              removeMatch(match.id);
            }
          }}
          className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

