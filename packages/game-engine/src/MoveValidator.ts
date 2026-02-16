import type { BoardPoints, BarState, BorneOffState, Player, Move } from './types.js';
import { NUM_POINTS } from './constants.js';
import { getPointOwner, getCheckerCount, calculateTarget, allInHomeBoard, playerSign } from './Board.js';

/**
 * Check if a specific move is legal given the current board state.
 */
export function isLegalMove(
  points: BoardPoints,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  move: Move,
  movesRemaining: number[],
): boolean {
  // Must have the die available
  if (!movesRemaining.includes(move.dieUsed)) return false;

  // If player has checkers on the bar, they MUST enter from the bar
  if (bar[player] > 0 && move.from !== 'bar') return false;

  // Validate source
  if (move.from === 'bar') {
    if (bar[player] <= 0) return false;
  } else {
    if (move.from < 0 || move.from >= NUM_POINTS) return false;
    const sign = playerSign(player);
    if (points[move.from] * sign <= 0) return false; // No checker of this player here
  }

  // Validate destination
  if (move.to === 'off') {
    return isLegalBearOff(points, bar, player, move);
  }

  if (move.to < 0 || move.to >= NUM_POINTS) return false;

  // Check the target matches the die
  const expectedTarget = calculateTarget(move.from, move.dieUsed, player);
  if (expectedTarget !== move.to) return false;

  // Check destination is not blocked by opponent (2+ opponent checkers)
  const opponent: Player = player === 'white' ? 'black' : 'white';
  const destOwner = getPointOwner(points, move.to);
  if (destOwner === opponent && getCheckerCount(points, move.to) >= 2) {
    return false;
  }

  return true;
}

function isLegalBearOff(
  points: BoardPoints,
  bar: BarState,
  player: Player,
  move: Move,
): boolean {
  // Can't bear off from bar
  if (move.from === 'bar') return false;

  // All checkers must be in home board
  if (!allInHomeBoard(points, bar, player)) return false;

  const from = move.from as number;

  if (player === 'white') {
    // White bears off from points 1-6 (indices 0-5), distance = index + 1
    const distance = from + 1;
    if (distance === move.dieUsed) {
      // Exact bear off
      return true;
    }
    if (move.dieUsed > distance) {
      // Can bear off with larger die only if no checker on a higher point
      for (let i = from + 1; i <= 5; i++) {
        if (points[i] > 0) return false;
      }
      return true;
    }
    return false;
  } else {
    // Black bears off from points 19-24 (indices 18-23), distance = 24 - index
    const distance = NUM_POINTS - from;
    if (distance === move.dieUsed) {
      return true;
    }
    if (move.dieUsed > distance) {
      // Can bear off with larger die only if no checker on a further point
      for (let i = from - 1; i >= 18; i--) {
        if (points[i] < 0) return false;
      }
      return true;
    }
    return false;
  }
}
