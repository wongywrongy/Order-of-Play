import { Match, Player, EventType } from '@/types';

let nextMatchNumber = 1;

export function createMatch(
  eventType: EventType,
  player1: Player,
  player2: Player,
  player3?: Player,
  player4?: Player,
  scheduledTime?: Date,
  matchNumber?: number
): Match {
  const number = matchNumber ?? nextMatchNumber++;
  if (matchNumber && matchNumber >= nextMatchNumber) {
    nextMatchNumber = matchNumber + 1;
  }
  return {
    id: `match-${Date.now()}-${Math.random()}`,
    matchNumber: number,
    eventType,
    player1,
    player2,
    player3,
    player4,
    status: 'pending',
    scheduledTime,
  };
}

export function resetMatchNumberCounter(maxNumber: number) {
  nextMatchNumber = maxNumber + 1;
}

export function startMatchOnCourt(match: Match, courtId: string): Match {
  return {
    ...match,
    status: 'active',
    courtId,
    startTime: new Date(),
    warmupStartTime: new Date(), // Start warmup timer
  };
}

export function completeMatch(match: Match): Match {
  return {
    ...match,
    status: 'completed',
    endTime: new Date(),
  };
}

