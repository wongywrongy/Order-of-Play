'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { PlayerListItem } from './PlayerListItem';

export function PlayerList() {
  const { players, addPlayer, matches } = useApp();
  const [newPlayerName, setNewPlayerName] = useState('');
  const activeMatches = matches.filter((m) => m.status === 'active');

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const getPlayerStatus = (playerId: string) => {
    const activeMatch = activeMatches.find(
      (m) => m.player1.id === playerId || m.player2.id === playerId
    );
    return activeMatch ? 'playing' : 'available';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Players</h2>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
          placeholder="Enter player name"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleAddPlayer}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
        >
          Add
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {players.length === 0 ? (
          <p className="text-gray-500 italic">No players added yet</p>
        ) : (
          players.map((player) => (
            <PlayerListItem
              key={player.id}
              player={player}
              status={getPlayerStatus(player.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

