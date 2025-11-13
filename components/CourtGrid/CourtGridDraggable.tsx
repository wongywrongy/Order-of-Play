'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import { CourtCardDraggable } from './CourtCardDraggable';
import { CourtLayoutControls } from './CourtLayoutControls';
import { EditModeToggle } from './EditModeToggle';
import { CourtLayoutView } from './CourtLayoutView';
import { Court } from '@/types';

type GridCellProps = {
  row: number;
  col: number;
  gridRows: number;
  gridCols: number;
};

function GridCell({ row, col, gridRows, gridCols }: GridCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `grid-${row}-${col}`,
  });

  // Check if this is the top-left cell of a valid 8x4 court placement
  const canPlaceCourt = row + 4 <= gridRows && col + 8 <= gridCols;

  return (
    <div
      ref={setNodeRef}
      className={`border border-gray-300 flex items-center justify-center ${
        isOver && canPlaceCourt
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-transparent hover:bg-gray-50'
      }`}
      style={{
        borderWidth: '1px',
        width: '30px',
        height: '30px',
        minWidth: '30px',
        minHeight: '30px',
      }}
    />
  );
}

type CourtGridDraggableProps = {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
};

export function CourtGridDraggable({ isEditMode, setIsEditMode }: CourtGridDraggableProps) {
  const { courts, courtLayout, moveCourtToGridPosition } = useApp();
  const [draggedOverCell, setDraggedOverCell] = useState<{ row: number; col: number } | null>(null);
  const [isDraggingCourt, setIsDraggingCourt] = useState(false);
  const [draggedCourtId, setDraggedCourtId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!isEditMode) return;

    const { active } = event;
    // Check if a court is being dragged
    const court = courts.find((c) => c.id === active.id);
    if (court) {
      setIsDraggingCourt(true);
      setDraggedCourtId(active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!isEditMode) return;

    const { active, over } = event;

    // Check if a court is being dragged
    const court = courts.find((c) => c.id === active.id);
    if (court) {
      setIsDraggingCourt(true);
      
      // Only update preview position when dragging over a grid cell within the court grid
      // Make sure we're only showing preview for grid cells, not other droppables
      if (over && typeof over.id === 'string' && over.id.startsWith('grid-')) {
        const parts = over.id.split('-');
        const gridRow = parseInt(parts[1]);
        const gridCol = parseInt(parts[2]);
        
        // Validate the grid coordinates are within bounds
        if (
          !isNaN(gridRow) && 
          !isNaN(gridCol) &&
          gridRow >= 0 && 
          gridRow < courtLayout.gridRows &&
          gridCol >= 0 && 
          gridCol < courtLayout.gridCols &&
          gridRow + 4 <= courtLayout.gridRows && 
          gridCol + 8 <= courtLayout.gridCols
        ) {
          setDraggedOverCell({ row: gridRow, col: gridCol });
        } else {
          setDraggedOverCell(null);
        }
      } else {
        // Not over a grid cell - clear preview
        setDraggedOverCell(null);
      }
    } else {
      // Not dragging a court
      setIsDraggingCourt(false);
      setDraggedOverCell(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isEditMode) return;

    const { active, over } = event;

    // Reset drag state
    setIsDraggingCourt(false);
    setDraggedOverCell(null);
    setDraggedCourtId(null);

    // Handle court dropped on any grid cell
    if (over && typeof over.id === 'string' && over.id.startsWith('grid-')) {
      const parts = over.id.split('-');
      const gridRow = parseInt(parts[1]);
      const gridCol = parseInt(parts[2]);
      
      // Check if it's a court being moved
      const court = courts.find((c) => c.id === active.id);
      if (court) {
        // Ensure court fits within grid bounds (court is 8 cols × 4 rows)
        const maxRow = Math.max(0, Math.min(gridRow, courtLayout.gridRows - 4));
        const maxCol = Math.max(0, Math.min(gridCol, courtLayout.gridCols - 8));
        moveCourtToGridPosition(active.id as string, maxRow, maxCol);
      }
    }
  };

  const handleDragCancel = () => {
    setIsDraggingCourt(false);
    setDraggedOverCell(null);
    setDraggedCourtId(null);
  };

  // Create map of courts by their top-left grid position
  const courtsByPosition = new Map<string, Court>();
  courts.forEach((court) => {
    if (court.gridRow !== undefined && court.gridCol !== undefined) {
      if (
        court.gridRow >= 0 &&
        court.gridRow < courtLayout.gridRows &&
        court.gridCol >= 0 &&
        court.gridCol < courtLayout.gridCols &&
        court.gridRow + 4 <= courtLayout.gridRows &&
        court.gridCol + 8 <= courtLayout.gridCols
      ) {
        const key = `${court.gridRow}-${court.gridCol}`;
        courtsByPosition.set(key, court);
      }
    }
  });

  // Check if a grid cell is occupied by a court
  // Exclude the court being dragged so grid cells show in its original position
  const isCellOccupied = (row: number, col: number): Court | null => {
    // Check if this cell is the top-left of any court (excluding dragged court)
    const key = `${row}-${col}`;
    const court = courtsByPosition.get(key);
    if (court && court.id !== draggedCourtId) return court;
    
    // Check if this cell is within any court's bounds (excluding dragged court)
    const courtEntries = Array.from(courtsByPosition.entries());
    for (const [posKey, court] of courtEntries) {
      if (court.id === draggedCourtId) continue; // Skip the court being dragged
      const [courtRow, courtCol] = posKey.split('-').map(Number);
      if (
        row >= courtRow &&
        row < courtRow + 4 &&
        col >= courtCol &&
        col < courtCol + 8
      ) {
        return court;
      }
    }
    return null;
  };

  // Calculate bounds of all courts for fitting view in non-edit mode
  const calculateCourtBounds = () => {
    if (courts.length === 0) {
      return { minRow: 0, maxRow: 4, minCol: 0, maxCol: 8, hasCourts: false };
    }

    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    courts.forEach((court) => {
      if (court.gridRow !== undefined && court.gridCol !== undefined) {
        minRow = Math.min(minRow, court.gridRow);
        maxRow = Math.max(maxRow, court.gridRow + 4); // Court is 4 rows tall
        minCol = Math.min(minCol, court.gridCol);
        maxCol = Math.max(maxCol, court.gridCol + 8); // Court is 8 cols wide
      }
    });

    if (minRow === Infinity) {
      return { minRow: 0, maxRow: 4, minCol: 0, maxCol: 8, hasCourts: false };
    }

    // Add padding
    const padding = 2;
    return {
      minRow: Math.max(0, minRow - padding),
      maxRow: Math.min(courtLayout.gridRows, maxRow + padding),
      minCol: Math.max(0, minCol - padding),
      maxCol: Math.min(courtLayout.gridCols, maxCol + padding),
      hasCourts: true,
    };
  };

  const courtBounds = calculateCourtBounds();

  return (
    <div className="h-full flex flex-col">
      {isEditMode && <div className="flex-shrink-0 px-4 pt-2 pb-2"><CourtLayoutControls /></div>}
      
      <div className="flex-1 min-h-0 px-4 pb-4">
      
      {isEditMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="overflow-auto border-2 border-blue-400 rounded h-full">
            <div
              data-grid-container
              className={`relative grid gap-0 bg-gray-50`}
              style={{
                gridTemplateColumns: `repeat(${courtLayout.gridCols}, 30px)`,
                gridTemplateRows: `repeat(${courtLayout.gridRows}, 30px)`,
                width: `${courtLayout.gridCols * 30}px`,
                height: `${courtLayout.gridRows * 30}px`,
                minWidth: `${courtLayout.gridCols * 30}px`,
                minHeight: `${courtLayout.gridRows * 30}px`,
              }}
            >
            {/* Render all grid cells */}
            {Array.from({ length: courtLayout.gridRows }).map((_, rowIndex) =>
              Array.from({ length: courtLayout.gridCols }).map((_, colIndex) => {
                const key = `${rowIndex}-${colIndex}`;
                const occupiedCourt = isCellOccupied(rowIndex, colIndex);
                const isTopLeft = occupiedCourt && 
                  occupiedCourt.gridRow === rowIndex && 
                  occupiedCourt.gridCol === colIndex;
                
                // Render court at top-left cell
                if (isTopLeft) {
                  return (
                    <div
                      key={key}
                      className="relative"
                      style={{
                        gridRowStart: rowIndex + 1,
                        gridRowEnd: rowIndex + 5, // 4 rows
                        gridColumnStart: colIndex + 1,
                        gridColumnEnd: colIndex + 9, // 8 columns
                        width: '240px', // 8 * 30px
                        height: '120px', // 4 * 30px
                      }}
                    >
                      <CourtCardDraggable court={occupiedCourt!} isEditMode={isEditMode} />
                    </div>
                  );
                }
                
                // Render empty grid cells only if not occupied by a court
                if (!occupiedCourt) {
                  return (
                    <GridCell 
                      key={key}
                      row={rowIndex} 
                      col={colIndex}
                      gridRows={courtLayout.gridRows}
                      gridCols={courtLayout.gridCols}
                    />
                  );
                }
                
                // For cells occupied by a court (but not top-left), render empty div to maintain grid structure
                return (
                  <div 
                    key={key} 
                    style={{ 
                      gridRow: rowIndex + 1, 
                      gridColumn: colIndex + 1,
                      width: '30px',
                      height: '30px',
                    }} 
                  />
                );
              })
            )}
            
            {/* Preview overlay showing 8x4 court area when dragging a court over a grid cell - rendered as grid item */}
            {isDraggingCourt && 
             draggedOverCell && 
             draggedOverCell.row >= 0 && 
             draggedOverCell.col >= 0 &&
             draggedOverCell.row < courtLayout.gridRows &&
             draggedOverCell.col < courtLayout.gridCols &&
             draggedOverCell.row + 4 <= courtLayout.gridRows && 
             draggedOverCell.col + 8 <= courtLayout.gridCols && (
              <div
                className="pointer-events-none border-2 border-blue-500 bg-blue-100 bg-opacity-30 z-40 flex items-center justify-center"
                style={{
                  gridRowStart: draggedOverCell.row + 1,
                  gridRowEnd: draggedOverCell.row + 5,
                  gridColumnStart: draggedOverCell.col + 1,
                  gridColumnEnd: draggedOverCell.col + 9,
                  borderStyle: 'dashed',
                }}
              >
                <span className="text-xs text-blue-700 font-semibold bg-white px-2 py-1 rounded shadow">
                  Court (8×4)
                </span>
              </div>
            )}
            </div>
          </div>
        </DndContext>
      ) : (
        <CourtLayoutView 
          courts={courts}
          courtLayout={courtLayout}
          isCellOccupied={isCellOccupied}
          isEditMode={isEditMode}
          courtBounds={courtBounds}
        />
      )}
      </div>
    </div>
  );
}
