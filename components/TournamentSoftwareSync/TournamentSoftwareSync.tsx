'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { exportToCSV, exportToTournamentSoftware, parseCSVImport, importFromTournamentSoftware } from '@/lib/services/tournamentSoftwareService';
import { CSVFormatDisplay } from './CSVFormatDisplay';

export function TournamentSoftwareSync() {
  const { matches, players, addMatch, setMatches } = useApp();
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExportCSV = () => {
    const csv = exportToCSV(matches);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `badminton-matches-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = exportToTournamentSoftware(matches);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `badminton-matches-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedMatches = parseCSVImport(text);
        const convertedMatches = importFromTournamentSoftware(importedMatches, players);
        
        // Add imported matches to existing matches
        setMatches((prev) => [...prev, ...convertedMatches]);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to import CSV');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold">TournamentSoftware.com Sync</h2>
      <p className="text-sm text-gray-600">
        Import/export match data to sync with TournamentSoftware.com
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 text-base">Export Matches</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-base">Import Matches</h3>
          <label className="block">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
          {importError && (
            <p className="mt-2 text-sm text-red-600 font-medium">{importError}</p>
          )}
          {importSuccess && (
            <p className="mt-2 text-sm text-green-600 font-medium">✓ Matches imported successfully!</p>
          )}
        </div>

        <CSVFormatDisplay />

        <div className="pt-3 border-t border-gray-300">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> TournamentSoftware.com doesn't have a public API yet. 
            Use CSV export/import to sync data manually. When an API becomes available, 
            this will be updated to support automatic syncing.
          </p>
        </div>
      </div>
    </div>
  );
}

