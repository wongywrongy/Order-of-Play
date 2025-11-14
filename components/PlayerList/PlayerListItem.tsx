'use client';

import { Player } from '@/types';
import { useApp } from '@/context/AppContext';

type PlayerListItemProps = {
  player: Player;
  status: 'playing' | 'available';
  onEdit?: () => void;
};

export function PlayerListItem({ player, status, onEdit }: PlayerListItemProps) {
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
        <div className="flex-1">
          <p className="font-medium">{player.name}</p>
          {status === 'playing' && courtName && (
            <p className="text-sm text-green-700 mt-1">Playing on {courtName}</p>
          )}
          {status === 'available' && (
            <p className="text-sm text-gray-500 mt-1">Available</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              title="Edit player"
            >
              ✏️
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${player.name}?`)) {
                removePlayer(player.id);
              }
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Remove player"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

