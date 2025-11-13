'use client';

export function CSVFormatDisplay() {
  const exampleCSV = `MatchID,Player1,Player2,ScheduledTime,Court,Status
match-1,John Smith,Michael Chen,2024-01-15T10:00:00Z,court-1,pending
match-2,Sarah Johnson,Emily Davis,2024-01-15T10:30:00Z,court-2,pending
match-3,David Lee,James Wilson,,,pending`;

  return (
    <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
      <h4 className="font-semibold text-sm mb-2">Required CSV Format:</h4>
      <div className="bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
        <pre className="text-xs font-mono text-gray-700 whitespace-pre">
{exampleCSV}
        </pre>
      </div>
      <div className="mt-3 text-xs text-gray-600 space-y-1">
        <p><strong>Required columns:</strong></p>
        <ul className="list-disc list-inside ml-2 space-y-0.5">
          <li><code className="bg-gray-100 px-1 rounded">MatchID</code> - Unique match identifier</li>
          <li><code className="bg-gray-100 px-1 rounded">Player1</code> - First player name (must exist in player list)</li>
          <li><code className="bg-gray-100 px-1 rounded">Player2</code> - Second player name (must exist in player list)</li>
          <li><code className="bg-gray-100 px-1 rounded">ScheduledTime</code> - ISO 8601 date string (optional)</li>
          <li><code className="bg-gray-100 px-1 rounded">Court</code> - Court ID (optional)</li>
          <li><code className="bg-gray-100 px-1 rounded">Status</code> - pending, active, or completed</li>
        </ul>
      </div>
    </div>
  );
}

