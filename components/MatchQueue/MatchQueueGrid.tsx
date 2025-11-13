'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MatchQueueGridItem } from './MatchQueueGridItem';

type MatchQueueGridItemWithSearchProps = {
  match: any;
  conflicts: string[];
  position: number;
  searchQuery: string;
};

function MatchQueueGridItemWithSearch({ match, conflicts, position, searchQuery }: MatchQueueGridItemWithSearchProps) {
  return <MatchQueueGridItem match={match} conflicts={conflicts} position={position} searchQuery={searchQuery} />;
}

export function MatchQueueGrid() {
  const { matches, getConflicts, recentlyCompletedMatches, undoCompleteMatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  const pendingMatches = matches
    .filter((m) => m.status === 'pending')
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
    });

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-shrink-0 flex items-center gap-2 mb-2">
        <input
          type="text"
          placeholder="Search matches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {recentlyCompletedMatches.length > 0 && (
          <button
            onClick={() => undoCompleteMatch(recentlyCompletedMatches[0].id)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors flex-shrink-0"
            title={`Undo: ${recentlyCompletedMatches[0].eventType} - ${recentlyCompletedMatches[0].player1.name} vs ${recentlyCompletedMatches[0].player2.name}`}
          >
            ↶ Undo
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {pendingMatches.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 italic">
              {searchQuery ? 'No matches found' : 'No pending matches'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-400 mt-2">Create matches to see them here</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1.5 auto-rows-fr">
            {pendingMatches.map((match) => {
              const conflicts = getConflicts(match.id);
              return (
                <MatchQueueGridItem
                  key={match.id}
                  match={match}
                  conflicts={conflicts}
                  position={0}
                  searchQuery={searchQuery}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

