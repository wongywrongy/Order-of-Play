import { Match, Player } from '@/types';

function isPlayerInMatch(playerId: string, match: Match): boolean {
  return (
    match.player1.id === playerId ||
    match.player2.id === playerId ||
    match.player3?.id === playerId ||
    match.player4?.id === playerId
  );
}

export function getMatchConflicts(match: Match, allMatches: Match[]): string[] {
  if (match.status !== 'pending') return [];

  const conflicts: string[] = [];
  const activeMatches = allMatches.filter((m) => m.status === 'active');

  // Check all players in the match
  const players = [
    match.player1,
    match.player2,
    match.player3,
    match.player4,
  ].filter((p): p is typeof match.player1 => p !== undefined);

  players.forEach((player) => {
    const isActive = activeMatches.some((m) => isPlayerInMatch(player.id, m));
    if (isActive) {
      conflicts.push(`${player.name} is currently playing`);
    }
  });

  return conflicts;
}

export function isPlayerAvailable(playerId: string, allMatches: Match[]): boolean {
  const activeMatches = allMatches.filter((m) => m.status === 'active');
  return !activeMatches.some((m) => isPlayerInMatch(playerId, m));
}

