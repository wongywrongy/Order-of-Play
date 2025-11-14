import { Player, EventType } from '@/types';

export function createPlayer(
  name: string,
  gender?: 'M' | 'F',
  events?: EventType[],
  notes?: string
): Player {
  return {
    id: `player-${Date.now()}-${Math.random()}`,
    name,
    gender,
    events: events || [],
    notes,
  };
}

