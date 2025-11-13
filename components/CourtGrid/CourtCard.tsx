'use client';

import { Court } from '@/types';
import { useApp } from '@/context/AppContext';

type CourtCardProps = {
  court: Court;
};

export function CourtCard({ court }: CourtCardProps) {
  const { startMatch, completeMatch, matches } = useApp();
  const availableMatches = matches.filter((m) => m.status === 'pending');

  const handleStartMatch = (matchId: string) => {
    startMatch(matchId, court.id);
  };

  const handleCompleteMatch = () => {
    if (court.currentMatch) {
      completeMatch(court.currentMatch.id);
    }
  };

  return (
    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-lg mb-3">{court.name}</h3>
      
      {court.currentMatch ? (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Active Match</p>
            <p className="font-medium">
              {court.currentMatch.player1.name} vs {court.currentMatch.player2.name}
            </p>
            {court.currentMatch.startTime && (
              <p className="text-xs text-gray-500 mt-1">
                Started: {new Date(court.currentMatch.startTime).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={handleCompleteMatch}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Complete Match
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-2">Court Available</p>
          {availableMatches.length > 0 ? (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleStartMatch(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">Select a match...</option>
              {availableMatches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.player1.name} vs {match.player2.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-400 italic">No pending matches</p>
          )}
        </div>
      )}
    </div>
  );
}

