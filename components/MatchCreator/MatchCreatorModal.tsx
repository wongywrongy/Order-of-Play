'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { EventType } from '@/types';

type MatchCreatorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MatchCreatorModal({ isOpen, onClose }: MatchCreatorModalProps) {
  const { players, addMatch } = useApp();
  const [eventType, setEventType] = useState<EventType>('MS');
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [player3Id, setPlayer3Id] = useState('');
  const [player4Id, setPlayer4Id] = useState('');

  const isDoubles = eventType === 'MD' || eventType === 'WD' || eventType === 'XD';

  const handleCreateMatch = () => {
    if (!player1Id || !player2Id) return;
    if (player1Id === player2Id) return;
    if (isDoubles && (!player3Id || !player4Id)) return;
    if (isDoubles && (player1Id === player3Id || player2Id === player4Id || player1Id === player4Id || player2Id === player3Id)) return;

    addMatch(
      eventType,
      player1Id,
      player2Id,
      isDoubles ? player3Id : undefined,
      isDoubles ? player4Id : undefined
    );

    // Reset form
    setPlayer1Id('');
    setPlayer2Id('');
    setPlayer3Id('');
    setPlayer4Id('');
    onClose();
  };

  const canCreate = () => {
    if (!player1Id || !player2Id || player1Id === player2Id) return false;
    if (isDoubles) {
      if (!player3Id || !player4Id) return false;
      if (player1Id === player3Id || player2Id === player4Id || player1Id === player4Id || player2Id === player3Id) return false;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Create Match</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value as EventType);
                // Reset doubles players when switching to singles
                if (e.target.value !== 'MD' && e.target.value !== 'WD' && e.target.value !== 'XD') {
                  setPlayer3Id('');
                  setPlayer4Id('');
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="MS">Men's Singles (MS)</option>
              <option value="WS">Women's Singles (WS)</option>
              <option value="MD">Men's Doubles (MD)</option>
              <option value="WD">Women's Doubles (WD)</option>
              <option value="XD">Mixed Doubles (XD)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isDoubles ? 'Team 1 Player 1' : 'Player 1'}
              </label>
              <select
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select player...</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {isDoubles ? 'Team 1 Player 2' : 'Player 2'}
              </label>
              {isDoubles ? (
                <select
                  value={player3Id}
                  onChange={(e) => setPlayer3Id(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select player...</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={player2Id}
                  onChange={(e) => setPlayer2Id(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select player...</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {isDoubles && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 Player 1</label>
                <select
                  value={player2Id}
                  onChange={(e) => setPlayer2Id(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select player...</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 Player 2</label>
                <select
                  value={player4Id}
                  onChange={(e) => setPlayer4Id(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select player...</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleCreateMatch}
              disabled={!canCreate()}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                canCreate()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Match
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

