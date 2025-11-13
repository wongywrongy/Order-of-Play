'use client';

import { CourtGrid } from '@/components/CourtGrid/CourtGrid';
import { MatchQueue } from '@/components/MatchQueue/MatchQueue';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { DndProvider } from '@/components/DndProvider/DndProvider';
import { MatchQueueHeader } from '@/components/MatchQueue/MatchQueueHeader';
import { EditModeToggle } from '@/components/CourtGrid/EditModeToggle';
import { CompletedMatchesList } from '@/components/CompletedMatchesList/CompletedMatchesList';
import { ConfigModal } from '@/components/Config/ConfigModal';
import { useApp } from '@/context/AppContext';
import { DragEndEvent } from '@dnd-kit/core';
import { useState } from 'react';

export default function Home() {
  const { assignMatchToCourt } = useApp();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Handle match dropped on court
    if (over && typeof over.id === 'string' && over.id.startsWith('court-drop-')) {
      const courtId = over.id.replace('court-drop-', '');
      const matchId = active.id as string;
      assignMatchToCourt(matchId, courtId);
    }
  };

  return (
    <DndProvider onDragEnd={handleDragEnd}>
      <main className="min-h-screen bg-gray-100">
        <div className="h-screen flex flex-col">
          {/* Main Content - Court Layout on Top, Order of Play on Bottom (2:1 ratio) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Shared Header */}
            <div className="flex items-center justify-between flex-shrink-0 px-4 pt-4 pb-2 bg-white">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      isEditMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Layout
                  </button>
                  <button
                    onClick={() => setIsConfigOpen(true)}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Config
                  </button>
                  <button
                    onClick={() => {}}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Menu
                  </button>
                </div>
                <h2 className="text-2xl font-bold">Court Layout</h2>
                <MatchQueueHeader />
              </div>
            </div>
            
            {/* Main Content Area - Court Layout and Completed Matches Sidebar */}
            <div className="flex-1 flex overflow-hidden">
                  {/* Left: Court Layout and Order of Play */}
                  <div className="flex-1 flex flex-col overflow-hidden" style={{ width: 'calc(100% - 280px)' }}>
                    {/* Top: Court Layout (5/8 height) */}
                    <div className="bg-white overflow-auto" style={{ flex: '5' }}>
                      <CourtGrid isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
                    </div>
                    
                    {/* Bottom: Order of Play (3/8 height) */}
                    <div className="bg-white overflow-auto" style={{ flex: '3' }}>
                      <MatchQueue />
                    </div>
                  </div>
              
              {/* Right: Completed Matches List */}
              <div className="flex-shrink-0" style={{ width: '280px' }}>
                <CompletedMatchesList />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar for non-essentials */}
        <Sidebar />
        
        {/* Config Modal */}
        <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
      </main>
    </DndProvider>
  );
}

