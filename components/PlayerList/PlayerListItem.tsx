'use client';

import { Player } from '@/types';
import { useApp } from '@/context/AppContext';

type PlayerListItemProps = {
  player: Player;
  status: 'playing' | 'available';
};

export function PlayerListItem({ player, status }: PlayerListItemProps) {
  const { removePlayer, matches, courts } = useApp();
  
  const getPlayerCourt = () => {
    const activeMatch = matches.find(
      (m) => m.status === 'active' && (m.player1.id === player.id || m.player2.id === player.id)
    );
    if (activeMatch?.courtId) {
      return courts.find((c) => c.id === activeMatch.courtId)?.name;
    }
    return null;
  };

  const courtName = getPlayerCourt();

  return (
    <div
      className={`p-3 rounded border ${
        status === 'playing'
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{player.name}</p>
          {status === 'playing' && courtName && (
            <p className="text-sm text-green-700 mt-1">Playing on {courtName}</p>
          )}
          {status === 'available' && (
            <p className="text-sm text-gray-500 mt-1">Available</p>
          )}
        </div>
        <button
          onClick={() => removePlayer(player.id)}
          className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

