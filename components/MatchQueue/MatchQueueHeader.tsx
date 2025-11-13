'use client';

import { useApp } from '@/context/AppContext';

export function MatchQueueHeader() {
  const { matches } = useApp();
  const pendingMatches = matches.filter((m) => m.status === 'pending');

  return (
    <h2 className="text-xl font-bold">
      Order of Play
      <span className="text-base font-normal text-gray-600 ml-2">
        ({pendingMatches.length} pending match{pendingMatches.length !== 1 ? 'es' : ''})
      </span>
    </h2>
  );
}

