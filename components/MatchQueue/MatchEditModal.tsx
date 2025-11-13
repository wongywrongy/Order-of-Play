'use client';

import { useState, useEffect } from 'react';
import { Match, EventType, Player } from '@/types';
import { useApp } from '@/context/AppContext';

type MatchEditModalProps = {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { player1Id?: string; player2Id?: string; player3Id?: string; player4Id?: string; scheduledTime?: Date }) => void;
};

export function MatchEditModal({ match, isOpen, onClose, onSave }: MatchEditModalProps) {
  const { players, matchIntervalMinutes } = useApp();
  const [player1Id, setPlayer1Id] = useState(match.player1.id);
  const [player2Id, setPlayer2Id] = useState(match.player2.id);
  const [player3Id, setPlayer3Id] = useState(match.player3?.id || '');
  const [player4Id, setPlayer4Id] = useState(match.player4?.id || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Generate time segments based on match interval
  const generateTimeSegments = (): string[] => {
    const segments: string[] = [];
    const startHour = 0;
    const endHour = 24;
    const interval = matchIntervalMinutes;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        segments.push(timeStr);
      }
    }
    
    return segments;
  };

  const timeSegments = generateTimeSegments();

  const isDoubles = match.eventType === 'MD' || match.eventType === 'WD' || match.eventType === 'XD';

  useEffect(() => {
    // Only initialize when modal first opens, not when match prop changes
    if (isOpen) {
      console.log('MatchEditModal useEffect - match:', match);
      console.log('MatchEditModal useEffect - match.scheduledTime:', match.scheduledTime);
      setPlayer1Id(match.player1.id);
      setPlayer2Id(match.player2.id);
      setPlayer3Id(match.player3?.id || '');
      setPlayer4Id(match.player4?.id || '');
      if (match.scheduledTime) {
        const date = new Date(match.scheduledTime);
        // Get local date string (YYYY-MM-DD)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        setScheduledDate(dateStr);
        // Get local time string (HH:MM) - must match one of the time segments
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        // Find the closest time segment if exact match doesn't exist
        const exactMatch = timeSegments.find(t => t === timeStr);
        setScheduledTime(exactMatch || timeStr);
        console.log('MatchEditModal useEffect - set date:', dateStr, 'time:', exactMatch || timeStr);
      } else {
        setScheduledDate('');
        setScheduledTime('');
        console.log('MatchEditModal useEffect - no scheduledTime, clearing fields');
      }
    }
  }, [isOpen]); // Only run when isOpen changes, not when match or timeSegments change

  if (!isOpen) return null;

  const handleSave = () => {
    const updates: { player1Id?: string; player2Id?: string; player3Id?: string; player4Id?: string; scheduledTime?: Date } = {};
    
    // Always include player updates if they've changed
    if (player1Id && player1Id !== match.player1.id) {
      updates.player1Id = player1Id;
    }
    if (player2Id && player2Id !== match.player2.id) {
      updates.player2Id = player2Id;
    }
    if (isDoubles) {
      if (player3Id && player3Id !== (match.player3?.id || '')) {
        updates.player3Id = player3Id;
      }
      if (player4Id && player4Id !== (match.player4?.id || '')) {
        updates.player4Id = player4Id;
      }
    }
    
    // Handle scheduled time - ALWAYS process if date and time are provided
    // This ensures scheduledTime is always saved when both fields are filled
    // If no date is provided but time is, use today's date
    const dateToUse = scheduledDate && scheduledDate.trim() !== '' 
      ? scheduledDate.trim() 
      : new Date().toISOString().slice(0, 10); // Use today's date if no date provided
    
    if (dateToUse && scheduledTime && scheduledTime.trim() !== '' && scheduledTime !== 'Select time...') {
      // Parse the time string (HH:MM format from dropdown)
      const timeParts = scheduledTime.trim().split(':');
      if (timeParts.length === 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          // Parse the date string (YYYY-MM-DD)
          const dateParts = dateToUse.split('-');
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10);
            const day = parseInt(dateParts[2], 10);
            
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
              // Create Date object in local timezone
              const newScheduledTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
              // Always set scheduledTime if we have valid date and time
              updates.scheduledTime = newScheduledTime;
              console.log('MatchEditModal handleSave - created scheduledTime:', newScheduledTime);
            } else {
              console.log('MatchEditModal handleSave - invalid date parts:', dateParts);
            }
          } else {
            console.log('MatchEditModal handleSave - dateParts length not 3:', scheduledDate);
          }
        } else {
          console.log('MatchEditModal handleSave - invalid time parts:', timeParts, 'hours:', hours, 'minutes:', minutes);
        }
      } else {
        console.log('MatchEditModal handleSave - timeParts length not 2:', scheduledTime);
      }
    } else {
      console.log('MatchEditModal handleSave - missing date or time:', { scheduledDate, scheduledTime });
      if (match.scheduledTime && (!scheduledDate || scheduledDate.trim() === '' || !scheduledTime || scheduledTime.trim() === '' || scheduledTime === 'Select time...')) {
        // Clear scheduled time if date or time is removed
        updates.scheduledTime = undefined;
        console.log('MatchEditModal handleSave - clearing scheduledTime');
      }
    }

    // Always call onSave - even if only scheduledTime is being updated
    // This ensures the scheduled time is saved
    console.log('MatchEditModal handleSave - final updates:', updates);
    console.log('MatchEditModal handleSave - scheduledDate:', scheduledDate, 'scheduledTime:', scheduledTime);
    onSave(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-6 max-w-md w-full mx-4" 
        onClick={(e) => {
          // Only stop propagation if clicking on the modal itself, not on form elements
          if (e.target === e.currentTarget) {
            e.stopPropagation();
          }
        }} 
        onMouseDown={(e) => {
          // Only stop propagation if clicking on the modal itself, not on form elements
          if (e.target === e.currentTarget) {
            e.stopPropagation();
          }
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Edit Match #{match.matchNumber}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Player 1</label>
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

          {isDoubles && (
            <div>
              <label className="block text-sm font-medium mb-2">Player 2 (Team 1)</label>
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
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Player {isDoubles ? '3' : '2'} (Team 2)</label>
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

          {isDoubles && (
            <div>
              <label className="block text-sm font-medium mb-2">Player 4 (Team 2)</label>
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
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <select
                value={scheduledTime}
                onChange={(e) => {
                  e.stopPropagation();
                  const newValue = e.target.value;
                  console.log('Time select onChange - new value:', newValue);
                  setScheduledTime(newValue);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  // Don't prevent default - we need the select to open
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select time...</option>
                {timeSegments.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Save
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

