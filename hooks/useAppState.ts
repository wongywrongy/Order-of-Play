import { useState, useCallback, useMemo } from 'react';
import { Player, Match, Court, CourtLayout } from '@/types';
import { createPlayer } from '@/lib/services/playerService';
import { createMatch, startMatchOnCourt, completeMatch as completeMatchService } from '@/lib/services/matchService';
import { createCourts, initializeCourtPositions } from '@/lib/services/courtService';
import { getMatchConflicts } from '@/lib/utils/conflictDetection';

export function useAppState() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Michael Chen' },
    { id: '3', name: 'David Lee' },
    { id: '4', name: 'James Wilson' },
    { id: '5', name: 'Sarah Johnson' },
    { id: '6', name: 'Emily Davis' },
    { id: '7', name: 'Jessica Brown' },
    { id: '8', name: 'Amanda Taylor' },
    { id: '9', name: 'Robert Anderson' },
    { id: '10', name: 'William Martinez' },
    { id: '11', name: 'Christopher White' },
    { id: '12', name: 'Daniel Harris' },
    { id: '13', name: 'Lisa Wang' },
    { id: '14', name: 'Jennifer Kim' },
    { id: '15', name: 'Michelle Zhang' },
    { id: '16', name: 'Nicole Patel' },
  ]);

  const [matches, setMatches] = useState<Match[]>([
    { id: 'm1', matchNumber: 1, eventType: 'MS', player1: { id: '1', name: 'John Smith' }, player2: { id: '2', name: 'Michael Chen' }, status: 'pending' },
    { id: 'm2', matchNumber: 2, eventType: 'MS', player1: { id: '3', name: 'David Lee' }, player2: { id: '4', name: 'James Wilson' }, status: 'pending' },
    { id: 'm3', matchNumber: 3, eventType: 'MS', player1: { id: '9', name: 'Robert Anderson' }, player2: { id: '10', name: 'William Martinez' }, status: 'pending' },
    { id: 'm4', matchNumber: 4, eventType: 'WS', player1: { id: '5', name: 'Sarah Johnson' }, player2: { id: '6', name: 'Emily Davis' }, status: 'pending' },
    { id: 'm5', matchNumber: 5, eventType: 'WS', player1: { id: '7', name: 'Jessica Brown' }, player2: { id: '8', name: 'Amanda Taylor' }, status: 'pending' },
    { id: 'm6', matchNumber: 6, eventType: 'WS', player1: { id: '13', name: 'Lisa Wang' }, player2: { id: '14', name: 'Jennifer Kim' }, status: 'pending' },
    { id: 'm7', matchNumber: 7, eventType: 'MD', player1: { id: '1', name: 'John Smith' }, player2: { id: '2', name: 'Michael Chen' }, player3: { id: '3', name: 'David Lee' }, player4: { id: '4', name: 'James Wilson' }, status: 'pending' },
    { id: 'm8', matchNumber: 8, eventType: 'MD', player1: { id: '9', name: 'Robert Anderson' }, player2: { id: '10', name: 'William Martinez' }, player3: { id: '11', name: 'Christopher White' }, player4: { id: '12', name: 'Daniel Harris' }, status: 'pending' },
    { id: 'm9', matchNumber: 9, eventType: 'WD', player1: { id: '5', name: 'Sarah Johnson' }, player2: { id: '6', name: 'Emily Davis' }, player3: { id: '7', name: 'Jessica Brown' }, player4: { id: '8', name: 'Amanda Taylor' }, status: 'pending' },
    { id: 'm10', matchNumber: 10, eventType: 'WD', player1: { id: '13', name: 'Lisa Wang' }, player2: { id: '14', name: 'Jennifer Kim' }, player3: { id: '15', name: 'Michelle Zhang' }, player4: { id: '16', name: 'Nicole Patel' }, status: 'pending' },
    { id: 'm11', matchNumber: 11, eventType: 'XD', player1: { id: '1', name: 'John Smith' }, player2: { id: '5', name: 'Sarah Johnson' }, player3: { id: '2', name: 'Michael Chen' }, player4: { id: '6', name: 'Emily Davis' }, status: 'pending' },
    { id: 'm12', matchNumber: 12, eventType: 'XD', player1: { id: '3', name: 'David Lee' }, player2: { id: '7', name: 'Jessica Brown' }, player3: { id: '4', name: 'James Wilson' }, player4: { id: '8', name: 'Amanda Taylor' }, status: 'pending' },
    { id: 'm13', matchNumber: 13, eventType: 'XD', player1: { id: '9', name: 'Robert Anderson' }, player2: { id: '13', name: 'Lisa Wang' }, player3: { id: '10', name: 'William Martinez' }, player4: { id: '14', name: 'Jennifer Kim' }, status: 'pending' },
    { id: 'm14', matchNumber: 14, eventType: 'MS', player1: { id: '11', name: 'Christopher White' }, player2: { id: '12', name: 'Daniel Harris' }, status: 'pending' },
    { id: 'm15', matchNumber: 15, eventType: 'WS', player1: { id: '15', name: 'Michelle Zhang' }, player2: { id: '16', name: 'Nicole Patel' }, status: 'pending' },
  ]);

  const [courtLayout, setCourtLayoutState] = useState<CourtLayout>({ 
    gridRows: 40, // Fixed large grid
    gridCols: 30, // Fixed large grid 
    numCourts: 4 
  });

  const [courts, setCourts] = useState<Court[]>(() => {
    const newCourts = createCourts(4);
    return initializeCourtPositions(newCourts, 40, 30, []);
  });

  const [warmupTimeSeconds, setWarmupTimeSeconds] = useState<number>(300); // Default 5 minutes (300 seconds)
  const [warmupFlashSeconds, setWarmupFlashSeconds] = useState<number>(10); // Default 10 seconds
  const [matchIntervalMinutes, setMatchIntervalMinutes] = useState<number>(30); // Default 30 minutes
  const [orderOfPlayCardHeight, setOrderOfPlayCardHeight] = useState<number>(120); // Default 120px

  const addPlayer = useCallback((
    name: string,
    gender?: 'M' | 'F',
    events?: string[],
    notes?: string
  ) => {
    const newPlayer = createPlayer(name, gender, events as any, notes);
    setPlayers((prev) => [...prev, newPlayer]);
  }, []);

  const updatePlayer = useCallback((
    id: string,
    updates: { name?: string; gender?: 'M' | 'F'; events?: string[]; notes?: string }
  ) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id
          ? {
              ...player,
              name: updates.name !== undefined ? updates.name : player.name,
              gender: updates.gender !== undefined ? updates.gender : player.gender,
              events: updates.events !== undefined ? (updates.events as any) : player.events,
              notes: updates.notes !== undefined ? updates.notes : player.notes,
            }
          : player
      )
    );
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setMatches((prev) => prev.filter((m) => 
      m.player1.id !== id && 
      m.player2.id !== id && 
      m.player3?.id !== id && 
      m.player4?.id !== id
    ));
  }, []);

  const addMatch = useCallback((
    eventType: string,
    player1Id: string,
    player2Id: string,
    player3Id?: string,
    player4Id?: string,
    scheduledTime?: Date
  ) => {
    const player1 = players.find((p) => p.id === player1Id);
    const player2 = players.find((p) => p.id === player2Id);
    const player3 = player3Id ? players.find((p) => p.id === player3Id) : undefined;
    const player4 = player4Id ? players.find((p) => p.id === player4Id) : undefined;
    
    if (!player1 || !player2) return;

    // Get the highest match number to ensure uniqueness
    setMatches((prev) => {
      const maxMatchNumber = prev.length > 0 
        ? Math.max(...prev.map(m => m.matchNumber))
        : 0;
      
      const newMatch = createMatch(
        eventType as any,
        player1,
        player2,
        player3,
        player4,
        scheduledTime,
        maxMatchNumber + 1
      );
      return [...prev, newMatch];
    });
  }, [players]);

  const removeMatch = useCallback((id: string) => {
    setMatches((prev) => {
      const match = prev.find((m) => m.id === id);
      if (match?.status === 'active') {
        setCourts((prevCourts) =>
          prevCourts.map((court) =>
            court.currentMatch?.id === id ? { ...court, currentMatch: undefined } : court
          )
        );
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const startMatch = useCallback((matchId: string, courtId: string) => {
    let updatedMatch: Match | undefined;
    
    setMatches((prev) => {
      const match = prev.find((m) => m.id === matchId);
      if (!match) return prev;
      
      updatedMatch = startMatchOnCourt(match, courtId);
      return prev.map((m) => (m.id === matchId ? updatedMatch! : m));
    });
    
    setCourts((prev) =>
      prev.map((court) => {
        if (court.id === courtId && updatedMatch) {
          return { ...court, currentMatch: updatedMatch };
        }
        return court;
      })
    );
  }, []);

  const removeMatchFromCourt = useCallback((matchId: string) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === matchId) {
          return {
            ...match,
            status: 'pending',
            courtId: undefined,
            startTime: undefined,
            warmupStartTime: undefined,
            matchStartTime: undefined,
            timerPaused: undefined,
            pausedDuration: undefined,
            lastPauseTime: undefined,
          };
        }
        return match;
      })
    );
    
    setCourts((prev) =>
      prev.map((court) =>
        court.currentMatch?.id === matchId
          ? { ...court, currentMatch: undefined, emptySince: new Date() }
          : court
      )
    );
  }, []);

  const [recentlyCompletedMatches, setRecentlyCompletedMatches] = useState<Match[]>([]);

  const completeMatch = useCallback((matchId: string) => {
    let completedMatch: Match | undefined;
    
    setMatches((prev) => {
      const match = prev.find((m) => m.id === matchId);
      if (!match) return prev;
      
      completedMatch = completeMatchService(match);
      // Store in recently completed for undo
      setRecentlyCompletedMatches((prevCompleted) => [completedMatch!, ...prevCompleted].slice(0, 10));
      
      return prev.map((m) => (m.id === matchId ? completedMatch! : m));
    });
    
    setCourts((prev) =>
      prev.map((court) =>
        court.currentMatch?.id === matchId 
          ? { ...court, currentMatch: undefined, emptySince: new Date() } 
          : court
      )
    );
  }, []);

  const undoCompleteMatch = useCallback((matchId: string) => {
    const matchToUndo = recentlyCompletedMatches.find((m) => m.id === matchId);
    if (!matchToUndo) return;

    // Restore match to pending status
    setMatches((prev) => {
      const restoredMatch: Match = {
        ...matchToUndo,
        status: 'pending',
        endTime: undefined,
        courtId: undefined,
        startTime: undefined,
        warmupStartTime: undefined,
        matchStartTime: undefined,
      };
      return [...prev, restoredMatch];
    });

    // Remove from recently completed
    setRecentlyCompletedMatches((prev) => prev.filter((m) => m.id !== matchId));
  }, [recentlyCompletedMatches]);

  const startMatchTimer = useCallback((matchId: string) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === matchId && match.warmupStartTime && !match.matchStartTime) {
          const updatedMatch = {
            ...match,
            matchStartTime: new Date(), // Start actual match timer
            timerPaused: false, // Reset pause state
            pausedDuration: 0, // Reset paused duration for match timer (only track match paused time)
            lastPauseTime: undefined, // Clear last pause time
          };
          
          // Also update the court's currentMatch
          setCourts((prevCourts) =>
            prevCourts.map((court) =>
              court.currentMatch?.id === matchId
                ? { ...court, currentMatch: updatedMatch }
                : court
            )
          );
          
          return updatedMatch;
        }
        return match;
      })
    );
  }, []);

  const toggleTimerPause = useCallback((matchId: string) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === matchId && match.warmupStartTime) {
          const now = Date.now();
          const wasPaused = match.timerPaused || false;
          const pausedDuration = match.pausedDuration || 0;
          
          let updatedMatch: Match;
          if (wasPaused) {
            // Resuming - calculate how long we were paused
            const pauseStart = match.lastPauseTime?.getTime() || now;
            const newPausedDuration = pausedDuration + (now - pauseStart);
            updatedMatch = {
              ...match,
              timerPaused: false,
              pausedDuration: newPausedDuration,
              lastPauseTime: undefined,
            };
          } else {
            // Pausing - record when we paused
            updatedMatch = {
              ...match,
              timerPaused: true,
              lastPauseTime: new Date(),
            };
          }
          
          // Also update the court's currentMatch
          setCourts((prevCourts) =>
            prevCourts.map((court) =>
              court.currentMatch?.id === matchId
                ? { ...court, currentMatch: updatedMatch }
                : court
            )
          );
          
          return updatedMatch;
        }
        return match;
      })
    );
  }, []);

  const updateMatchScore = useCallback((matchId: string, score: { set1?: { player1: number; player2: number }; set2?: { player1: number; player2: number }; set3?: { player1: number; player2: number } }) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === matchId) {
          return {
            ...match,
            score,
          };
        }
        return match;
      })
    );
    
    // Also update score on court if match is active
    setCourts((prev) =>
      prev.map((court) => {
        if (court.currentMatch?.id === matchId) {
          return {
            ...court,
            currentMatch: {
              ...court.currentMatch,
              score,
            },
          };
        }
        return court;
      })
    );
  }, []);

  const toggleCheckIn = useCallback((matchId: string, side: 'player1' | 'player2') => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === matchId) {
          const currentCheckedIn = match.checkedIn || { player1: false, player2: false };
          return {
            ...match,
            checkedIn: {
              ...currentCheckedIn,
              [side]: !currentCheckedIn[side],
            },
          };
        }
        return match;
      })
    );
  }, []);

  const updateMatchDetails = useCallback((
    matchId: string,
    updates: { player1Id?: string; player2Id?: string; player3Id?: string; player4Id?: string; scheduledTime?: Date }
  ) => {
    console.log('updateMatchDetails called - matchId:', matchId, 'updates:', updates);
    setMatches((prev) => {
      const updated = prev.map((match) => {
        if (match.id === matchId) {
          const updatedMatch = { ...match };
          
          if (updates.player1Id !== undefined) {
            const player1 = players.find((p) => p.id === updates.player1Id);
            if (player1) {
              updatedMatch.player1 = player1;
            }
          }
          if (updates.player2Id !== undefined) {
            const player2 = players.find((p) => p.id === updates.player2Id);
            if (player2) {
              updatedMatch.player2 = player2;
            }
          }
          if (updates.player3Id !== undefined) {
            if (updates.player3Id) {
              const player3 = players.find((p) => p.id === updates.player3Id);
              if (player3) {
                updatedMatch.player3 = player3;
              }
            } else {
              updatedMatch.player3 = undefined;
            }
          }
          if (updates.player4Id !== undefined) {
            if (updates.player4Id) {
              const player4 = players.find((p) => p.id === updates.player4Id);
              if (player4) {
                updatedMatch.player4 = player4;
              }
            } else {
              updatedMatch.player4 = undefined;
            }
          }
          if (updates.scheduledTime !== undefined) {
            // Ensure we're storing the Date object correctly
            const scheduledTime = updates.scheduledTime instanceof Date 
              ? updates.scheduledTime 
              : new Date(updates.scheduledTime);
            console.log('updateMatchDetails - setting scheduledTime:', scheduledTime, 'for match:', matchId);
            updatedMatch.scheduledTime = scheduledTime;
          }
          
          console.log('updateMatchDetails - updatedMatch:', updatedMatch);
          return updatedMatch;
        }
        return match;
      });
      
      console.log('updateMatchDetails - updated array length:', updated.length);
      
      // Also update on court if match is active
      setCourts((prevCourts) =>
        prevCourts.map((court) => {
          if (court.currentMatch?.id === matchId) {
            const updatedMatch = updated.find(m => m.id === matchId);
            if (updatedMatch) {
              return { ...court, currentMatch: updatedMatch };
            }
          }
          return court;
        })
      );
      
      return updated;
    });
  }, [players]);

  const setCourtLayout = useCallback((layout: CourtLayout) => {
    setCourtLayoutState(layout);
    setCourts((prev) => {
      const newCourts = createCourts(layout.numCourts, prev);
      return initializeCourtPositions(newCourts, layout.gridRows, layout.gridCols, []);
    });
  }, []);

  const setNumCourts = useCallback((numCourts: number) => {
    // Fixed grid size: 40 rows x 30 columns
    // Each court is 8 cols × 4 rows, so max courts = (40/4) * (30/8) = 10 * 3 = 30
    const maxCourts = Math.floor((40 / 4) * (30 / 8)); // 30 courts max
    const validNumCourts = Math.min(numCourts, maxCourts);
    
    setCourts((prev) => {
      let updatedCourts: Court[];
      if (validNumCourts > prev.length) {
        // Add new courts - preserve existing courts and their positions
        const newCourts = createCourts(validNumCourts - prev.length, prev);
        // Initialize positions for new courts, considering existing court positions
        const courtsWithPositions = initializeCourtPositions(newCourts, 40, 30, prev);
        updatedCourts = [...prev, ...courtsWithPositions];
      } else if (validNumCourts < prev.length) {
        // Remove excess courts
        updatedCourts = prev.slice(0, validNumCourts);
      } else {
        updatedCourts = prev;
      }
      
      // Only initialize positions for courts that don't have positions yet
      const courtsWithPositions = updatedCourts.filter(c => c.gridRow !== undefined && c.gridCol !== undefined);
      const courtsWithoutPositions = updatedCourts.filter(c => c.gridRow === undefined || c.gridCol === undefined);
      if (courtsWithoutPositions.length > 0) {
        const initialized = initializeCourtPositions(courtsWithoutPositions, 40, 30, courtsWithPositions);
        return [...courtsWithPositions, ...initialized];
      }
      return updatedCourts;
    });
    setCourtLayoutState((prev) => ({ ...prev, numCourts: validNumCourts }));
  }, []);

  const moveCourtToGridPosition = useCallback((courtId: string, gridRow: number, gridCol: number) => {
    setCourts((prev) => {
      return prev.map((c) => {
        if (c.id === courtId) {
          return {
            ...c,
            gridRow,
            gridCol,
          };
        }
        return c;
      });
    });
  }, []);

  const updateCourtName = useCallback((courtId: string, newName: string) => {
    setCourts((prev) => {
      return prev.map((c) => {
        if (c.id === courtId) {
          return {
            ...c,
            name: newName,
          };
        }
        return c;
      });
    });
  }, []);

  const rotateCourt = useCallback((courtId: string) => {
    setCourts((prev) => {
      return prev.map((c) => {
        if (c.id === courtId) {
          const currentRotation = c.rotation || 0;
          const newRotation = (currentRotation + 90) % 360;
          return { ...c, rotation: newRotation };
        }
        return c;
      });
    });
  }, []);

  const assignMatchToCourt = useCallback((matchId: string, courtId: string) => {
    startMatch(matchId, courtId);
  }, [startMatch]);


  const reorderMatchQueue = useCallback((activeId: string, overId: string) => {
    setMatches((prev) => {
      // Only reorder pending matches
      const pendingMatches = prev.filter((m) => m.status === 'pending');
      const otherMatches = prev.filter((m) => m.status !== 'pending');
      
      const activeIndex = pendingMatches.findIndex((m) => m.id === activeId);
      const overIndex = pendingMatches.findIndex((m) => m.id === overId);
      
      if (activeIndex === -1 || overIndex === -1) return prev;
      
      const newPendingMatches = [...pendingMatches];
      const [removed] = newPendingMatches.splice(activeIndex, 1);
      newPendingMatches.splice(overIndex, 0, removed);
      
      return [...otherMatches, ...newPendingMatches];
    });
  }, []);

  const getConflicts = useCallback(
    (matchId: string): string[] => {
      const match = matches.find((m) => m.id === matchId);
      if (!match) return [];
      return getMatchConflicts(match, matches);
    },
    [matches]
  );

    return useMemo(
    () => ({
      players,
      matches,
      courts,
      courtLayout,
      warmupTimeSeconds,
      setWarmupTimeSeconds,
      warmupFlashSeconds,
      setWarmupFlashSeconds,
      matchIntervalMinutes,
      setMatchIntervalMinutes,
      orderOfPlayCardHeight,
      setOrderOfPlayCardHeight,
      addPlayer,
      updatePlayer,
      updateMatchDetails,
      removePlayer,
      addMatch,
      removeMatch,
      startMatch,
      completeMatch,
      undoCompleteMatch,
      removeMatchFromCourt,
      startMatchTimer,
      toggleTimerPause,
      updateMatchScore,
      toggleCheckIn,
      recentlyCompletedMatches,
      setNumCourts,
      moveCourtToGridPosition,
      updateCourtName,
      rotateCourt,
      assignMatchToCourt,
      reorderMatchQueue,
      getConflicts,
      setMatches,
    }),
    [
      players,
      matches,
      courts,
      courtLayout,
      warmupTimeSeconds,
      setWarmupTimeSeconds,
      warmupFlashSeconds,
      setWarmupFlashSeconds,
      matchIntervalMinutes,
      setMatchIntervalMinutes,
      orderOfPlayCardHeight,
      setOrderOfPlayCardHeight,
      addPlayer,
      updatePlayer,
      removePlayer,
      addMatch,
      removeMatch,
      startMatch,
      completeMatch,
      undoCompleteMatch,
      removeMatchFromCourt,
      startMatchTimer,
      toggleTimerPause,
      updateMatchScore,
      toggleCheckIn,
      updateMatchDetails,
      recentlyCompletedMatches,
      setNumCourts,
      moveCourtToGridPosition,
      updateCourtName,
      rotateCourt,
      assignMatchToCourt,
      reorderMatchQueue,
      getConflicts,
      setMatches,
    ]
  );
}

