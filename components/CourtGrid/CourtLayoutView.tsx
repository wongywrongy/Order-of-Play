'use client';

import { useRef, useEffect, useState } from 'react';
import { Court, CourtLayout } from '@/types';
import { CourtCardDraggable } from './CourtCardDraggable';

type CourtLayoutViewProps = {
  courts: Court[];
  courtLayout: CourtLayout;
  isCellOccupied: (row: number, col: number) => Court | null;
  isEditMode: boolean;
  courtBounds: {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
    hasCourts: boolean;
  };
};

export function CourtLayoutView({ 
  courts, 
  courtLayout, 
  isCellOccupied, 
  isEditMode,
  courtBounds 
}: CourtLayoutViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current || !gridRef.current || !courtBounds.hasCourts) {
      setScale(1);
      return;
    }

    const updateScale = () => {
      const container = containerRef.current;
      const grid = gridRef.current;
      if (!container || !grid) return;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate grid dimensions based on court bounds
      const gridCols = courtBounds.maxCol - courtBounds.minCol;
      const gridRows = courtBounds.maxRow - courtBounds.minRow;
      
      // Estimate cell size (30px minimum)
      const cellWidth = 30;
      const cellHeight = 30;
      const gridWidth = gridCols * cellWidth;
      const gridHeight = gridRows * cellHeight;
      
      // Calculate scale to fit
      const scaleX = containerWidth / gridWidth;
      const scaleY = containerHeight / gridHeight;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      setScale(newScale);
    };

    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateScale, 0);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateScale);
    };
  }, [courtBounds]);

  if (!courtBounds.hasCourts) {
    return (
      <div className="border-2 border-gray-300 rounded" style={{ height: '400px' }}>
        <div className="flex items-center justify-center h-full text-gray-500">
          No courts positioned
        </div>
      </div>
    );
  }

  const gridCols = courtBounds.maxCol - courtBounds.minCol;
  const gridRows = courtBounds.maxRow - courtBounds.minRow;

  return (
    <div 
      ref={containerRef}
      className="border-2 border-gray-300 rounded overflow-hidden"
      style={{ 
        width: '100%',
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        ref={gridRef}
        className="grid gap-0 bg-gray-50"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 30px)`,
          gridTemplateRows: `repeat(${gridRows}, 30px)`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {Array.from({ length: gridRows }).map((_, rowOffset) => {
          const rowIndex = courtBounds.minRow + rowOffset;
          return Array.from({ length: gridCols }).map((_, colOffset) => {
            const colIndex = courtBounds.minCol + colOffset;
            const key = `${rowIndex}-${colIndex}`;
            const occupiedCourt = isCellOccupied(rowIndex, colIndex);
            const isTopLeft = occupiedCourt && 
              occupiedCourt.gridRow === rowIndex && 
              occupiedCourt.gridCol === colIndex;
            
            if (isTopLeft) {
              return (
                <div
                  key={key}
                  className="relative"
                  style={{
                    gridRowStart: rowOffset + 1,
                    gridRowEnd: rowOffset + 5,
                    gridColumnStart: colOffset + 1,
                    gridColumnEnd: colOffset + 9,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <CourtCardDraggable court={occupiedCourt!} isEditMode={isEditMode} />
                </div>
              );
            }
            
            return null;
          });
        })}
      </div>
    </div>
  );
}

