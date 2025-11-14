export type Player = {
  id: string;
  name: string;
  gender?: 'M' | 'F';
  events?: EventType[]; // Array of events the player participates in (MS, WS, MD, WD, XD)
  notes?: string;
};

export type EventType = 'MS' | 'WS' | 'MD' | 'WD' | 'XD';

export type Match = {
  id: string;
  matchNumber: number; // Unique, constant match number
  eventType: EventType;
  player1: Player;
  player2: Player;
  player3?: Player; // For doubles
  player4?: Player; // For doubles
  courtId?: string;
  status: 'pending' | 'active' | 'completed';
  scheduledTime?: Date;
  startTime?: Date;
  endTime?: Date;
  warmupStartTime?: Date; // When warmup period started
  matchStartTime?: Date; // When actual match started (after warmup)
  timerPaused?: boolean; // Whether the timer is paused
  pausedDuration?: number; // Total paused time in ms
  lastPauseTime?: Date; // When the timer was last paused
  checkedIn?: {
    player1: boolean; // Team 1 checked in
    player2: boolean; // Team 2 checked in
  };
  score?: {
    set1?: { player1: number; player2: number };
    set2?: { player1: number; player2: number };
    set3?: { player1: number; player2: number };
  };
};

export type Court = {
  id: string;
  name: string;
  currentMatch?: Match;
  gridRow?: number; // Grid row position (top-left corner of court)
  gridCol?: number; // Grid column position (top-left corner of court)
  rotation?: number; // Rotation in degrees (0, 90, 180, 270)
  emptySince?: Date; // When the court became empty (for empty timer)
};

export type CourtLayout = {
  gridRows: number;
  gridCols: number;
  numCourts: number;
};

export type MatchOrder = {
  matchId: string;
  position: number;
};

