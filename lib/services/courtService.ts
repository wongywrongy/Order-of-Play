import { Court, CourtLayout } from '@/types';

export function createCourts(numNewCourts: number, existingCourts: Court[] = []): Court[] {
  const newCourts: Court[] = [];
  const existingCount = existingCourts.length;
  
  for (let i = 0; i < numNewCourts; i++) {
    newCourts.push({
      id: `court-${existingCount + i + 1}-${Date.now()}-${Math.random()}`,
      name: `Court ${existingCount + i + 1}`,
    });
  }
  
  return newCourts;
}

export function initializeCourtPositions(
  courts: Court[], 
  gridRows: number, 
  gridCols: number,
  existingCourts: Court[] = []
): Court[] {
  // Each court takes 4 rows and 8 columns (swapped for landscape orientation)
  // Find available positions for courts that don't have positions yet
  
  // Create a set of occupied positions from existing courts
  const occupiedPositions = new Set<string>();
  existingCourts.forEach((court) => {
    if (court.gridRow !== undefined && court.gridCol !== undefined) {
      // Mark all cells occupied by this court
      for (let r = court.gridRow; r < court.gridRow + 4; r++) {
        for (let c = court.gridCol; c < court.gridCol + 8; c++) {
          occupiedPositions.add(`${r}-${c}`);
        }
      }
    }
  });
  
  // Helper to check if a position is available
  const isPositionAvailable = (row: number, col: number): boolean => {
    if (row + 4 > gridRows || col + 8 > gridCols) return false;
    for (let r = row; r < row + 4; r++) {
      for (let c = col; c < col + 8; c++) {
        if (occupiedPositions.has(`${r}-${c}`)) return false;
      }
    }
    return true;
  };
  
  // Helper to mark a position as occupied
  const markPositionOccupied = (row: number, col: number) => {
    for (let r = row; r < row + 4; r++) {
      for (let c = col; c < col + 8; c++) {
        occupiedPositions.add(`${r}-${c}`);
      }
    }
  };
  
  return courts.map((court) => {
    if (court.gridRow !== undefined && court.gridCol !== undefined) {
      // Court already has a position, mark it as occupied
      markPositionOccupied(court.gridRow, court.gridCol);
      return court;
    }
    
    // Find first available position
    const courtsPerRow = Math.floor(gridCols / 8);
    for (let attempt = 0; attempt < 100; attempt++) {
      const courtIndex = attempt;
      const courtRow = Math.floor(courtIndex / courtsPerRow) * 4;
      const courtCol = (courtIndex % courtsPerRow) * 8;
      
      if (isPositionAvailable(courtRow, courtCol)) {
        markPositionOccupied(courtRow, courtCol);
        return {
          ...court,
          gridRow: courtRow,
          gridCol: courtCol,
        };
      }
    }
    
    // If no position found, return court without position
    return court;
  });
}
