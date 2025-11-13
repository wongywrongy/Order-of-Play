'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';

export function CourtLayoutControls() {
  const { courtLayout, setNumCourts } = useApp();
  const [numCourts, setNumCourtsLocal] = useState(courtLayout.numCourts);
  const [error, setError] = useState<string | null>(null);

  // Sync local state with context
  useEffect(() => {
    setNumCourtsLocal(courtLayout.numCourts);
  }, [courtLayout]);

  const handleApply = () => {
    setError(null);
    
    if (numCourts <= 0) {
      setError('Number of courts must be greater than 0');
      return;
    }

    // Calculate max possible courts based on grid size (each court is 8x4)
    const maxCourts = Math.floor((courtLayout.gridRows / 4) * (courtLayout.gridCols / 8));
    if (numCourts > maxCourts) {
      setError(`Number of courts (${numCourts}) exceeds maximum capacity (${maxCourts} courts). Reduce number of courts.`);
      return;
    }

    setNumCourts(numCourts);
  };

  const maxCourts = Math.floor((courtLayout.gridRows / 4) * (courtLayout.gridCols / 8));

  return (
    <div className="p-3 bg-gray-50 rounded border border-gray-300 space-y-2">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium">Number of Courts:</span>
          <input
            type="number"
            min="1"
            max={maxCourts}
            value={numCourts}
            onChange={(e) => setNumCourtsLocal(parseInt(e.target.value) || 1)}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </label>
        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded text-sm transition-colors"
        >
          Apply
        </button>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          Drag courts to position them on the grid (courts can overlap)
        </span>
        <span className="text-gray-500">
          Max capacity: {maxCourts} courts
        </span>
      </div>
      {error && (
        <div className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
