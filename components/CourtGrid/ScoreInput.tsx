'use client';

import { useState } from 'react';
import { Match } from '@/types';
import { ScoreModal } from './ScoreModal';

type ScoreInputProps = {
  match: Match;
  onScoreUpdate: (score: { set1?: { player1: number; player2: number }; set2?: { player1: number; player2: number }; set3?: { player1: number; player2: number } }) => void;
  showAsButton?: boolean; // If true, shows as a "Complete" button instead of a score badge
};

export function ScoreInput({ match, onScoreUpdate, showAsButton = false }: ScoreInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDisplayScore = () => {
    if (!match.score) return null;
    const sets = [];
    if (match.score.set1) sets.push(`${match.score.set1.player1}-${match.score.set1.player2}`);
    if (match.score.set2) sets.push(`${match.score.set2.player1}-${match.score.set2.player2}`);
    if (match.score.set3) sets.push(`${match.score.set3.player1}-${match.score.set3.player2}`);
    return sets.join(', ');
  };

  if (showAsButton) {
    return (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded transition-colors"
          style={{ fontSize: '10px' }}
        >
          Complete
        </button>
        <ScoreModal
          match={match}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onScoreUpdate}
        />
      </>
    );
  }

  return (
    <>
      <div>
        {match.score ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-0.5 bg-gray-100 hover:bg-gray-200 rounded px-1.5 py-1 transition-colors"
            style={{ fontSize: '11px' }}
          >
            <span className="font-bold">{getDisplayScore()}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-800 bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 font-medium transition-colors"
            style={{ fontSize: '11px' }}
          >
            Score
          </button>
        )}
      </div>
      <ScoreModal
        match={match}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onScoreUpdate}
      />
    </>
  );
}

