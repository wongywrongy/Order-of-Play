import { Player } from '@/types';

export function createPlayer(name: string): Player {
  return {
    id: `player-${Date.now()}`,
    name,
  };
}

