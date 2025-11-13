import { Match, MatchOrder } from '@/types';

export function reorderMatches(matches: Match[], matchOrders: MatchOrder[]): Match[] {
  const orderMap = new Map(matchOrders.map((order) => [order.matchId, order.position]));
  
  return [...matches].sort((a, b) => {
    const posA = orderMap.get(a.id) ?? Infinity;
    const posB = orderMap.get(b.id) ?? Infinity;
    return posA - posB;
  });
}

export function createMatchOrder(matchId: string, position: number): MatchOrder {
  return { matchId, position };
}

