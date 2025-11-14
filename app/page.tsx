'use client';

import { CourtGrid } from '@/components/CourtGrid/CourtGrid';
import { MatchQueue } from '@/components/MatchQueue/MatchQueue';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { DndProvider } from '@/components/DndProvider/DndProvider';
import { MatchQueueHeader } from '@/components/MatchQueue/MatchQueueHeader';
import { EditModeToggle } from '@/components/CourtGrid/EditModeToggle';
import { CompletedMatchesList } from '@/components/CompletedMatchesList/CompletedMatchesList';
import { ConfigModal } from '@/components/Config/ConfigModal';
import { PlayerListModal } from '@/components/PlayerList/PlayerListModal';
import { MatchCreatorModal } from '@/components/MatchCreator/MatchCreatorModal';
import { ResizableDivider } from '@/components/utils/ResizableDivider';
import { useApp } from '@/context/AppContext';
import { DragEndEvent } from '@dnd-kit/core';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const { assignMatchToCourt } = useApp();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Resizable panel sizes
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [courtLayoutHeight, setCourtLayoutHeight] = useState(0); // Will be calculated as percentage
  const mainContentRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Handle match dropped on court
    if (over && typeof over.id === 'string' && over.id.startsWith('court-drop-')) {
      const courtId = over.id.replace('court-drop-', '');
      const matchId = active.id as string;
      assignMatchToCourt(matchId, courtId);
    }
  };

  // Calculate initial court layout height as percentage (5/8 = 62.5%)
  useEffect(() => {
    const updateInitialHeight = () => {
      if (leftContentRef.current) {
        const totalHeight = leftContentRef.current.clientHeight;
        if (courtLayoutHeight === 0) {
          setCourtLayoutHeight((5 / 8) * totalHeight);
        }
      }
    };
    
    updateInitialHeight();
    window.addEventListener('resize', updateInitialHeight);
    return () => window.removeEventListener('resize', updateInitialHeight);
  }, [courtLayoutHeight]);

  const handleSidebarResize = (newWidth: number) => {
    setSidebarWidth(newWidth);
  };

  const handleVerticalResize = (newHeight: number) => {
    setCourtLayoutHeight(newHeight);
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
                    onClick={() => setIsPlayersOpen(true)}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Players
                  </button>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Create
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
            <div ref={mainContentRef} className="flex-1 flex overflow-hidden">
              {/* Left: Court Layout and Order of Play */}
              <div ref={leftContentRef} className="flex flex-col overflow-hidden" style={{ width: `calc(100% - ${sidebarWidth}px)` }}>
                {/* Top: Court Layout */}
                <div 
                  className="bg-white overflow-auto" 
                  style={{ 
                    height: courtLayoutHeight > 0 ? `${courtLayoutHeight}px` : '62.5%',
                    minHeight: '200px'
                  }}
                >
                  <CourtGrid isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
                </div>
                
                {/* Resizable divider */}
                <ResizableDivider
                  direction="vertical"
                  onResize={(newHeight) => {
                    setCourtLayoutHeight(newHeight);
                  }}
                  containerRef={leftContentRef as React.RefObject<HTMLElement>}
                  minSize={200}
                  maxSize={leftContentRef.current ? leftContentRef.current.clientHeight - 200 : Infinity}
                />
                
                {/* Bottom: Order of Play */}
                <div 
                  className="bg-white overflow-auto flex-1" 
                  style={{ minHeight: '200px' }}
                >
                  <MatchQueue />
                </div>
              </div>
              
              {/* Resizable divider for sidebar */}
              <ResizableDivider
                direction="horizontal"
                onResize={handleSidebarResize}
                containerRef={mainContentRef as React.RefObject<HTMLElement>}
                minSize={200}
                maxSize={mainContentRef.current ? mainContentRef.current.clientWidth - 400 : Infinity}
              />
              
              {/* Right: Completed Matches List */}
              <div className="flex-shrink-0" style={{ width: `${sidebarWidth}px` }}>
                <CompletedMatchesList />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar for non-essentials */}
        <Sidebar />
        
        {/* Config Modal */}
        <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
        
        {/* Players Modal */}
        <PlayerListModal isOpen={isPlayersOpen} onClose={() => setIsPlayersOpen(false)} />
        
        {/* Create Match Modal */}
        <MatchCreatorModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </main>
    </DndProvider>
  );
}

