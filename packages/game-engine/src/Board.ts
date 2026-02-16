import type { BoardPoints, BarState, BorneOffState, Player, Move } from './types.js';
import { INITIAL_BOARD, NUM_POINTS, DIRECTION } from './constants.js';

export function createInitialBoard(): BoardPoints {
  return [...INITIAL_BOARD];
}

export function createEmptyBar(): BarState {
  return { white: 0, black: 0 };
}

export function createEmptyBorneOff(): BorneOffState {
  return { white: 0, black: 0 };
}

export function cloneBoard(points: BoardPoints): BoardPoints {
  return [...points];
}

export function cloneBar(bar: BarState): BarState {
  return { ...bar };
}

export function cloneBorneOff(borneOff: BorneOffState): BorneOffState {
  return { ...borneOff };
}

/** Returns the player who owns the checkers at a point, or null if empty. */
export function getPointOwner(points: BoardPoints, index: number): Player | null {
  if (points[index] > 0) return 'white';
  if (points[index] < 0) return 'black';
  return null;
}

/** Returns the number of checkers at a point (always positive). */
export function getCheckerCount(points: BoardPoints, index: number): number {
  return Math.abs(points[index]);
}

/** Returns the sign value for a player: +1 for white, -1 for black. */
export function playerSign(player: Player): number {
  return player === 'white' ? 1 : -1;
}

/**
 * Apply a single move to the board state (mutates copies).
 * Returns { points, bar, borneOff, hit } where hit is true if an opponent checker was sent to the bar.
 */
export function applyMove(
  points: BoardPoints,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  move: Move,
): { points: BoardPoints; bar: BarState; borneOff: BorneOffState; hit: boolean } {
  const newPoints = cloneBoard(points);
  const newBar = cloneBar(bar);
  const newBorneOff = cloneBorneOff(borneOff);
  const sign = playerSign(player);
  const opponent: Player = player === 'white' ? 'black' : 'white';
  let hit = false;

  // Remove checker from source
  if (move.from === 'bar') {
    newBar[player]--;
  } else {
    newPoints[move.from] -= sign;
  }

  // Place checker at destination
  if (move.to === 'off') {
    newBorneOff[player]++;
  } else {
    // Check if hitting an opponent blot
    const destOwner = getPointOwner(newPoints, move.to);
    if (destOwner === opponent && getCheckerCount(newPoints, move.to) === 1) {
      // Hit: send opponent to bar
      newPoints[move.to] = 0;
      newBar[opponent]++;
      hit = true;
    }

    newPoints[move.to] += sign;
  }

  return { points: newPoints, bar: newBar, borneOff: newBorneOff, hit };
}

/** Calculate the target point index for a move. Returns -1 if it would go off the board (bear off candidate). */
export function calculateTarget(from: number | 'bar', dieValue: number, player: Player): number {
  let fromIndex: number;

  if (from === 'bar') {
    // White enters from point 24 (index 23), moving toward lower indices
    // Black enters from point 1 (index 0), moving toward higher indices
    fromIndex = player === 'white' ? NUM_POINTS : -1;
  } else {
    fromIndex = from;
  }

  const target = fromIndex + dieValue * DIRECTION[player];
  return target;
}

/** Check if all of a player's checkers are in their home board (or borne off). */
export function allInHomeBoard(points: BoardPoints, bar: BarState, player: Player): boolean {
  if (bar[player] > 0) return false;

  const sign = playerSign(player);

  for (let i = 0; i < NUM_POINTS; i++) {
    const checkersBelong = points[i] * sign > 0;
    if (!checkersBelong) continue;

    if (player === 'white' && i > 5) return false;
    if (player === 'black' && i < 18) return false;
  }

  return true;
}

/** Calculate pip count for a player. */
export function calculatePipCount(points: BoardPoints, bar: BarState, player: Player): number {
  const sign = playerSign(player);
  let pips = 0;

  for (let i = 0; i < NUM_POINTS; i++) {
    if (points[i] * sign > 0) {
      const count = Math.abs(points[i]);
      // Pip distance: for white, distance from point 0 is i+1. For black, distance from point 23 is 24-i.
      const distance = player === 'white' ? i + 1 : NUM_POINTS - i;
      pips += count * distance;
    }
  }

  // Bar checkers: 25 pips each (must enter the full board)
  pips += bar[player] * 25;

  return pips;
}
