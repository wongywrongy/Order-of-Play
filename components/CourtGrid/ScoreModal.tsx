'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/types';

type ScoreModalProps = {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onSave: (score: { set1?: { player1: number; player2: number }; set2?: { player1: number; player2: number }; set3?: { player1: number; player2: number } }) => void;
};

export function ScoreModal({ match, isOpen, onClose, onSave }: ScoreModalProps) {
  const [scores, setScores] = useState<{
    set1: { player1: number; player2: number };
    set2: { player1: number; player2: number };
    set3: { player1: number; player2: number };
  }>({
    set1: match.score?.set1 || { player1: 0, player2: 0 },
    set2: match.score?.set2 || { player1: 0, player2: 0 },
    set3: match.score?.set3 || { player1: 0, player2: 0 },
  });

  useEffect(() => {
    if (match.score) {
      setScores({
        set1: match.score.set1 || { player1: 0, player2: 0 },
        set2: match.score.set2 || { player1: 0, player2: 0 },
        set3: match.score.set3 || { player1: 0, player2: 0 },
      });
    }
  }, [match.score]);

  const handleScoreChange = (set: 'set1' | 'set2' | 'set3', player: 'player1' | 'player2', value: number) => {
    const newScores = { ...scores };
    const opponent = player === 'player1' ? 'player2' : 'player1';
    const currentOpponentScore = newScores[set][opponent];
    
    newScores[set] = { ...newScores[set], [player]: value };

    // Auto-fill winning score logic - adjust live as user types
    // If opponent score is 0 or if current value suggests this is the loser's score
    if (value > 0) {
      let winnerScore = 0;
      
      // Calculate winner's score based on loser's score
      if (value < 20) {
        // Loser score < 20: winner = 21
        winnerScore = 21;
      } else if (value === 20) {
        // Loser score = 20: winner = 22 (must win by 2, deuce scenario)
        winnerScore = 22;
      } else if (value === 21) {
        // Loser score = 21: winner = 23 (must win by 2)
        winnerScore = 23;
      } else if (value > 21 && value <= 28) {
        // Loser score > 21 and <= 28: winner = loser + 2 (must win by 2, deuce scenario)
        // e.g., 22 -> 24, 23 -> 25, 24 -> 26, etc.
        winnerScore = value + 2;
      } else if (value === 29) {
        // Loser score = 29: winner = 30 (first to 30 wins)
        winnerScore = 30;
      }
      
      // Update opponent score if:
      // 1. Opponent score is 0 (entering loser's score first), OR
      // 2. Current value is greater than opponent score (user is adjusting loser's score up)
      if (currentOpponentScore === 0 || (value > currentOpponentScore && winnerScore > 0)) {
        newScores[set][opponent] = winnerScore;
      }
    }

    setScores(newScores);
  };

  const getWinner = (set: 'set1' | 'set2' | 'set3') => {
    const setScore = scores[set];
    if (setScore.player1 === 0 && setScore.player2 === 0) return null;
    
    // Determine winner based on badminton rules
    if (setScore.player1 > setScore.player2) {
      // Player 1 wins if they have more points
      // But must check if it's a valid win (21+ with 2 point lead, or 30)
      if (setScore.player1 >= 21) {
        if (setScore.player1 === 30) return 'player1';
        if (setScore.player1 - setScore.player2 >= 2) return 'player1';
      }
    } else if (setScore.player2 > setScore.player1) {
      // Player 2 wins if they have more points
      if (setScore.player2 >= 21) {
        if (setScore.player2 === 30) return 'player2';
        if (setScore.player2 - setScore.player1 >= 2) return 'player2';
      }
    }
    
    return null; // No winner yet or invalid score
  };

  const getSetWins = () => {
    const player1Wins = [getWinner('set1'), getWinner('set2'), getWinner('set3')].filter(
      (winner) => winner === 'player1'
    ).length;
    const player2Wins = [getWinner('set1'), getWinner('set2'), getWinner('set3')].filter(
      (winner) => winner === 'player2'
    ).length;
    return { player1Wins, player2Wins };
  };

  const getOverallWinner = () => {
    const { player1Wins, player2Wins } = getSetWins();
    if (player1Wins >= 2) return 'player1';
    if (player2Wins >= 2) return 'player2';
    return null;
  };

  const handleSave = () => {
    const scoreToSave: { set1?: { player1: number; player2: number }; set2?: { player1: number; player2: number }; set3?: { player1: number; player2: number } } = {};
    if (scores.set1.player1 > 0 || scores.set1.player2 > 0) {
      scoreToSave.set1 = scores.set1;
    }
    if (scores.set2.player1 > 0 || scores.set2.player2 > 0) {
      scoreToSave.set2 = scores.set2;
    }
    if (scores.set3.player1 > 0 || scores.set3.player2 > 0) {
      scoreToSave.set3 = scores.set3;
    }
    onSave(scoreToSave);
    onClose();
  };

  if (!isOpen) return null;

  const isDoubles = match.player3 && match.player4;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl border-2 border-gray-300 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Match Score</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>


        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-3">
            <div className="font-semibold text-base mb-1">{match.eventType}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="text-xs font-semibold text-gray-600"></div>
            <div className="text-xs font-semibold text-gray-600 text-center">Set 1</div>
            <div className="text-xs font-semibold text-gray-600 text-center">Set 2</div>
            <div className="text-xs font-semibold text-gray-600 text-center">Set 3</div>
          </div>
          
          <div className="space-y-1.5">
            {/* Player 1 row */}
            {(() => {
              const { player1Wins, player2Wins } = getSetWins();
              const overallWinner = getOverallWinner();
              const isLosing = player1Wins < player2Wins && player2Wins > 0;
              return (
                <div className={`grid grid-cols-4 gap-2 items-center rounded p-1 ${
                  overallWinner === 'player1' 
                    ? 'bg-green-100 border-2 border-green-500' 
                    : isLosing 
                    ? 'bg-red-100 border-2 border-red-500' 
                    : ''
                }`}>
                  <div className={`text-sm font-medium flex items-center gap-2 ${
                    overallWinner === 'player1' 
                      ? 'text-green-800 font-bold' 
                      : isLosing 
                      ? 'text-red-800 font-bold' 
                      : 'text-gray-700'
                  }`}>
                    {isDoubles ? `${match.player1.name} / ${match.player3?.name}` : match.player1.name}
                    {player1Wins > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                        overallWinner === 'player1'
                          ? 'bg-green-200 text-green-800'
                          : isLosing
                          ? 'bg-red-200 text-red-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {player1Wins}
                      </span>
                    )}
                  </div>
                  <div className={`border rounded ${getWinner('set1') === 'player1' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scores.set1.player1 || ''}
                      onChange={(e) => handleScoreChange('set1', 'player1', parseInt(e.target.value) || 0)}
                      className={`w-full text-center border-0 rounded px-2 py-1.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${getWinner('set1') === 'player1' ? 'bg-green-50' : ''}`}
                      placeholder="0"
                    />
                  </div>
                  <div className={`border rounded ${getWinner('set2') === 'player1' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scores.set2.player1 || ''}
                      onChange={(e) => handleScoreChange('set2', 'player1', parseInt(e.target.value) || 0)}
                      className={`w-full text-center border-0 rounded px-2 py-1.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${getWinner('set2') === 'player1' ? 'bg-green-50' : ''}`}
                      placeholder="0"
                    />
                  </div>
                  <div className={`border rounded ${getWinner('set3') === 'player1' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scores.set3.player1 || ''}
                      onChange={(e) => handleScoreChange('set3', 'player1', parseInt(e.target.value) || 0)}
                      className={`w-full text-center border-0 rounded px-2 py-1.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${getWinner('set3') === 'player1' ? 'bg-green-50' : ''}`}
                      placeholder="0"
                    />
                  </div>
                </div>
              );
            })()}
            
            {/* Separator line */}
            <div className="border-t border-gray-300 my-1"></div>
            
            {/* Player 2 row */}
            {(() => {
              const { player1Wins, player2Wins } = getSetWins();
              const overallWinner = getOverallWinner();
              const isLosing = player2Wins < player1Wins && player1Wins > 0;
              return (
                <div className={`grid grid-cols-4 gap-2 items-center rounded p-1 ${
                  overallWinner === 'player2' 
                    ? 'bg-green-100 border-2 border-green-500' 
                    : isLosing 
                    ? 'bg-red-100 border-2 border-red-500' 
                    : ''
                }`}>
                  <div className={`text-sm font-medium flex items-center gap-2 ${
                    overallWinner === 'player2' 
                      ? 'text-green-800 font-bold' 
                      : isLosing 
                      ? 'text-red-800 font-bold' 
                      : 'text-gray-700'
                  }`}>
                    {isDoubles ? `${match.player2.name} / ${match.player4?.name}` : match.player2.name}
                    {player2Wins > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                        overallWinner === 'player2'
                          ? 'bg-green-200 text-green-800'
                          : isLosing
                          ? 'bg-red-200 text-red-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {player2Wins}
                      </span>
                    )}
                  </div>
                  <div className={`border rounded ${getWinner('set1') === 'player2' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scores.set1.player2 || ''}
                      onChange={(e) => handleScoreChange('set1', 'player2', parseInt(e.target.value) || 0)}
                      className={`w-full text-center border-0 rounded px-2 py-1.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${getWinner('set1') === 'player2' ? 'bg-green-50' : ''}`}
                      placeholder="0"
                    />
                  </div>
                  <div className={`border rounded ${getWinner('set2') === 'player2' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scores.set2.player2 || ''}
                      onChange={(e) => handleScoreChange('set2', 'player2', parseInt(e.target.value) || 0)}
                      className={`w-full text-center border-0 rounded px-2 py-1.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${getWinner('set2') === 'player2' ? 'bg-green-50' : ''}`}
                      placeholder="0"
                    />
                  </div>
                  <div className={`border rounded ${getWinner('set3') === 'player2' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scores.set3.player2 || ''}
                      onChange={(e) => handleScoreChange('set3', 'player2', parseInt(e.target.value) || 0)}
                      className={`w-full text-center border-0 rounded px-2 py-1.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${getWinner('set3') === 'player2' ? 'bg-green-50' : ''}`}
                      placeholder="0"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Save Score
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

