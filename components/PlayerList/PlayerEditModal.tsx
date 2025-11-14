'use client';

import { useState, useEffect } from 'react';
import { Player, EventType } from '@/types';

type PlayerEditModalProps = {
  player: Player | null; // null for new player, Player for editing
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerData: { name: string; gender?: 'M' | 'F'; events?: EventType[]; notes?: string }) => void;
};

export function PlayerEditModal({ player, isOpen, onClose, onSave }: PlayerEditModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | ''>('');
  const [events, setEvents] = useState<EventType[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (player) {
        // Editing existing player
        setName(player.name);
        setGender(player.gender || '');
        setEvents(player.events || []);
        setNotes(player.notes || '');
      } else {
        // Creating new player
        setName('');
        setGender('');
        setEvents([]);
        setNotes('');
      }
    }
  }, [isOpen, player]);

  if (!isOpen) return null;

  const handleEventToggle = (eventType: EventType) => {
    setEvents((prev) =>
      prev.includes(eventType)
        ? prev.filter((e) => e !== eventType)
        : [...prev, eventType]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      gender: gender || undefined,
      events: events.length > 0 ? events : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {player ? `Edit Player: ${player.name}` : 'Create New Player'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Enter player name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'M' | 'F' | '')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Not specified</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Events</label>
            <div className="grid grid-cols-2 gap-2">
              {(['MS', 'WS', 'MD', 'WD', 'XD'] as EventType[]).map((eventType) => (
                <label
                  key={eventType}
                  className="flex items-center space-x-2 p-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={events.includes(eventType)}
                    onChange={() => handleEventToggle(eventType)}
                    className="rounded"
                  />
                  <span className="text-sm">
                    {eventType === 'MS' && 'Men\'s Singles'}
                    {eventType === 'WS' && 'Women\'s Singles'}
                    {eventType === 'MD' && 'Men\'s Doubles'}
                    {eventType === 'WD' && 'Women\'s Doubles'}
                    {eventType === 'XD' && 'Mixed Doubles'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows={3}
              placeholder="Additional notes about the player..."
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              name.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {player ? 'Save Changes' : 'Create Player'}
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
  );
}

