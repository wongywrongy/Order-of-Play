'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { PlayerListItem } from './PlayerListItem';
import { PlayerEditModal } from './PlayerEditModal';
import { Player, EventType } from '@/types';

type PlayerListModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PlayerListModal({ isOpen, onClose }: PlayerListModalProps) {
  const { players, addPlayer, updatePlayer, matches } = useApp();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const activeMatches = matches.filter((m) => m.status === 'active');

  const handleCreatePlayer = () => {
    setEditingPlayer(null);
    setIsEditModalOpen(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setIsEditModalOpen(true);
  };

  const handleSavePlayer = (playerData: { name: string; gender?: 'M' | 'F'; events?: EventType[]; notes?: string }) => {
    if (editingPlayer) {
      // Update existing player
      updatePlayer(editingPlayer.id, playerData);
    } else {
      // Create new player
      addPlayer(
        playerData.name,
        playerData.gender,
        playerData.events?.map(e => e as string),
        playerData.notes
      );
    }
    setIsEditModalOpen(false);
    setEditingPlayer(null);
  };

  const getPlayerStatus = (playerId: string) => {
    const activeMatch = activeMatches.find(
      (m) => 
        m.player1.id === playerId || 
        m.player2.id === playerId ||
        m.player3?.id === playerId ||
        m.player4?.id === playerId
    );
    return activeMatch ? 'playing' : 'available';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Players</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreatePlayer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
            >
              + Create New Player
            </button>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {players.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">No players added yet</p>
              ) : (
                players.map((player) => (
                  <PlayerListItem
                    key={player.id}
                    player={player}
                    status={getPlayerStatus(player.id)}
                    onEdit={() => handleEditPlayer(player)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <PlayerEditModal
        player={editingPlayer}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPlayer(null);
        }}
        onSave={handleSavePlayer}
      />
    </>
  );
}

