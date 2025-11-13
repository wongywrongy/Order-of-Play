'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

type ConfigModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const { warmupTimeSeconds, setWarmupTimeSeconds, warmupFlashSeconds, setWarmupFlashSeconds, matchIntervalMinutes, setMatchIntervalMinutes } = useApp();
  const [localWarmupTime, setLocalWarmupTime] = useState(warmupTimeSeconds);
  const [localFlashTime, setLocalFlashTime] = useState(warmupFlashSeconds);
  const [localMatchInterval, setLocalMatchInterval] = useState(matchIntervalMinutes);

  useEffect(() => {
    if (isOpen) {
      setLocalWarmupTime(warmupTimeSeconds);
      setLocalFlashTime(warmupFlashSeconds);
      setLocalMatchInterval(matchIntervalMinutes);
    }
  }, [isOpen, warmupTimeSeconds, warmupFlashSeconds, matchIntervalMinutes]);

  if (!isOpen) return null;

  const handleSave = () => {
    setWarmupTimeSeconds(localWarmupTime);
    setWarmupFlashSeconds(localFlashTime);
    setMatchIntervalMinutes(localMatchInterval);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Configuration</h3>
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
              Warmup Time (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="1800"
              value={localWarmupTime}
              onChange={(e) => setLocalWarmupTime(parseInt(e.target.value) || 300)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {formatTime(warmupTimeSeconds)} ({warmupTimeSeconds} seconds)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Warmup Flash Duration (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={localFlashTime}
              onChange={(e) => setLocalFlashTime(parseInt(e.target.value) || 10)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {warmupFlashSeconds} second{warmupFlashSeconds !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Match Interval (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={localMatchInterval}
              onChange={(e) => setLocalMatchInterval(parseInt(e.target.value) || 30)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {matchIntervalMinutes} minute{matchIntervalMinutes !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Save
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

