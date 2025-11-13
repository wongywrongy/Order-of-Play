'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { EventType } from '@/types';

export function MatchCreator() {
  const { players, addMatch } = useApp();
  const [eventType, setEventType] = useState<EventType>('MS');
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [player3Id, setPlayer3Id] = useState('');
  const [player4Id, setPlayer4Id] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const isDoubles = eventType === 'MD' || eventType === 'WD' || eventType === 'XD';

  const handleCreateMatch = () => {
    if (!player1Id || !player2Id) return;
    if (player1Id === player2Id) return;
    if (isDoubles && (!player3Id || !player4Id)) return;
    if (isDoubles && (player1Id === player3Id || player2Id === player4Id || player1Id === player4Id || player2Id === player3Id)) return;

    const scheduledDate = scheduledTime ? new Date(scheduledTime) : undefined;
    addMatch(
      eventType,
      player1Id,
      player2Id,
      isDoubles ? player3Id : undefined,
      isDoubles ? player4Id : undefined,
      scheduledDate
    );

    // Reset form
    setPlayer1Id('');
    setPlayer2Id('');
    setPlayer3Id('');
    setPlayer4Id('');
    setScheduledTime('');
  };

  const canCreate = () => {
    if (!player1Id || !player2Id || player1Id === player2Id) return false;
    if (isDoubles) {
      if (!player3Id || !player4Id) return false;
      if (player1Id === player3Id || player2Id === player4Id || player1Id === player4Id || player2Id === player3Id) return false;
    }
    return true;
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold">Create Match</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Event Type</label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as EventType)}
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
          <label className="block text-sm font-medium mb-1">
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
          <label className="block text-sm font-medium mb-1">
            {isDoubles ? 'Team 2 Player 1' : 'Player 2'}
          </label>
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
      </div>

      {isDoubles && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team 1 Player 2</label>
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
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Team 2 Player 2</label>
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

      <div>
        <label className="block text-sm font-medium mb-1">Scheduled Time (Optional)</label>
        <input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={handleCreateMatch}
        disabled={!canCreate()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Create Match
      </button>
    </div>
  );
}
