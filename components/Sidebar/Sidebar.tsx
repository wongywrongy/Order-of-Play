'use client';

import { useState } from 'react';
import { PlayerList } from '@/components/PlayerList/PlayerList';
import { MatchCreator } from '@/components/MatchCreator/MatchCreator';
import { TournamentSoftwareSync } from '@/components/TournamentSoftwareSync/TournamentSoftwareSync';
import { PastMatches } from '@/components/PastMatches/PastMatches';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-colors"
        title={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">Settings & Tools</h2>
          
          <div className="space-y-6">
            <div>
              <PlayerList />
            </div>
            
            <div>
              <MatchCreator />
            </div>
            
            <div>
              <PastMatches />
            </div>
            
            <div>
              <TournamentSoftwareSync />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

