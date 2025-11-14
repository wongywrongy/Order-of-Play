import { Match, Player } from '@/types';

/**
 * TournamentSoftware.com Integration Service
 * 
 * Note: TournamentSoftware.com doesn't have a public API, but this service
 * provides functionality for:
 * 1. Importing match data from exported formats (CSV, JSON)
 * 2. Exporting match data in formats compatible with TournamentSoftware.com
 * 3. Future API integration when available
 */

export type TournamentSoftwareMatch = {
  matchId: string;
  player1Name: string;
  player2Name: string;
  scheduledTime?: string;
  court?: string;
  round?: string;
  status: 'pending' | 'active' | 'completed';
};

export type TournamentSoftwareExport = {
  tournament: string;
  date: string;
  matches: TournamentSoftwareMatch[];
};

/**
 * Convert TournamentSoftware.com format to internal Match format
 */
export function importFromTournamentSoftware(
  data: TournamentSoftwareMatch[],
  players: Player[]
): Match[] {
  return data.map((tsMatch) => {
    const player1 = players.find((p) => p.name === tsMatch.player1Name);
    const player2 = players.find((p) => p.name === tsMatch.player2Name);

    if (!player1 || !player2) {
      throw new Error(`Players not found: ${tsMatch.player1Name} or ${tsMatch.player2Name}`);
    }

    return {
      id: tsMatch.matchId,
      matchNumber: 1, // Default match number, should be provided in TournamentSoftwareMatch type
      eventType: 'MS' as const, // Default event type, should be provided in TournamentSoftwareMatch type
      player1,
      player2,
      courtId: tsMatch.court,
      status: tsMatch.status,
      scheduledTime: tsMatch.scheduledTime ? new Date(tsMatch.scheduledTime) : undefined,
      startTime: tsMatch.scheduledTime ? new Date(tsMatch.scheduledTime) : undefined,
    };
  });
}

/**
 * Convert internal Match format to TournamentSoftware.com format
 */
export function exportToTournamentSoftware(matches: Match[]): TournamentSoftwareExport {
  return {
    tournament: 'Badminton Tournament',
    date: new Date().toISOString(),
    matches: matches.map((match) => ({
      matchId: match.id,
      player1Name: match.player1.name,
      player2Name: match.player2.name,
      scheduledTime: match.startTime?.toISOString(),
      court: match.courtId,
      status: match.status,
    })),
  };
}

/**
 * Parse CSV data from TournamentSoftware.com export
 */
export function parseCSVImport(csvText: string): TournamentSoftwareMatch[] {
  const lines = csvText.split('\n').filter((line) => line.trim());
  const headers = lines[0].split(',').map((h) => h.trim());
  
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const match: Partial<TournamentSoftwareMatch> = {
      status: 'pending',
    };

    headers.forEach((header, index) => {
      const value = values[index];
      switch (header.toLowerCase()) {
        case 'matchid':
        case 'match id':
          match.matchId = value;
          break;
        case 'player1':
        case 'player 1':
          match.player1Name = value;
          break;
        case 'player2':
        case 'player 2':
          match.player2Name = value;
          break;
        case 'scheduledtime':
        case 'scheduled time':
          match.scheduledTime = value;
          break;
        case 'court':
          match.court = value;
          break;
        case 'status':
          match.status = value as 'pending' | 'active' | 'completed';
          break;
      }
    });

    if (!match.matchId || !match.player1Name || !match.player2Name) {
      throw new Error('Invalid CSV format: missing required fields');
    }

    return match as TournamentSoftwareMatch;
  });
}

/**
 * Export matches to CSV format compatible with TournamentSoftware.com
 */
export function exportToCSV(matches: Match[]): string {
  const headers = ['MatchID', 'Player1', 'Player2', 'ScheduledTime', 'Court', 'Status'];
  const rows = matches.map((match) => [
    match.id,
    match.player1.name,
    match.player2.name,
    match.startTime?.toISOString() || '',
    match.courtId || '',
    match.status,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

