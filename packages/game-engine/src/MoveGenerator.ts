import type { BoardPoints, BarState, BorneOffState, Player, Move } from './types.js';
import { NUM_POINTS, DIRECTION } from './constants.js';
import { applyMove, getPointOwner, getCheckerCount, calculateTarget, allInHomeBoard, playerSign } from './Board.js';
import { getBearOffMoves } from './BearingOff.js';

export interface TurnSequence {
  moves: Move[];
}

/**
 * Generate all legal turn sequences for the current player given remaining dice.
 * Handles: bar entry priority, bearing off, forced-move rules, doubles.
 */
export function generateAllLegalTurns(
  points: BoardPoints,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  movesRemaining: number[],
): TurnSequence[] {
  if (movesRemaining.length === 0) return [{ moves: [] }];

  const results: TurnSequence[] = [];
  generateRecursive(points, bar, borneOff, player, movesRemaining, [], results);

  if (results.length === 0) {
    // No moves possible at all
    return [{ moves: [] }];
  }

  // Apply forced-move rules:
  // 1. Must use as many dice as possible
  // 2. If only one of two dice can be used, must use the larger one
  const maxMoves = Math.max(...results.map(r => r.moves.length));
  let filtered = results.filter(r => r.moves.length === maxMoves);

  // If we could only use one die (maxMoves === 1) and had two different dice,
  // must use the larger one
  if (maxMoves === 1 && movesRemaining.length === 2 && movesRemaining[0] !== movesRemaining[1]) {
    const largerDie = Math.max(...movesRemaining);
    const withLarger = filtered.filter(r => r.moves[0].dieUsed === largerDie);
    if (withLarger.length > 0) {
      filtered = withLarger;
    }
  }

  // Deduplicate by final board state
  return deduplicateByFinalState(filtered, points, bar, borneOff, player);
}

function generateRecursive(
  points: BoardPoints,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  movesRemaining: number[],
  movesSoFar: Move[],
  results: TurnSequence[],
): void {
  if (movesRemaining.length === 0) {
    results.push({ moves: [...movesSoFar] });
    return;
  }

  let foundAnyMove = false;

  // Get unique dice values to avoid duplicate branches
  const uniqueDice = [...new Set(movesRemaining)];

  for (const die of uniqueDice) {
    const singleMoves = generateSingleMoves(points, bar, borneOff, player, die);

    for (const move of singleMoves) {
      foundAnyMove = true;
      const result = applyMove(points, bar, borneOff, player, move);
      const newRemaining = removeDieFromList(movesRemaining, die);

      generateRecursive(
        result.points,
        result.bar,
        result.borneOff,
        player,
        newRemaining,
        [...movesSoFar, move],
        results,
      );
    }
  }

  if (!foundAnyMove) {
    // Player is blocked — record the partial turn
    if (movesSoFar.length > 0) {
      results.push({ moves: [...movesSoFar] });
    }
  }
}

/**
 * Generate all legal single-checker moves for a given die value.
 */
function generateSingleMoves(
  points: BoardPoints,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  dieValue: number,
): Move[] {
  const moves: Move[] = [];
  const sign = playerSign(player);
  const opponent: Player = player === 'white' ? 'black' : 'white';

  // If player has checkers on bar, MUST enter from bar
  if (bar[player] > 0) {
    const target = calculateTarget('bar', dieValue, player);
    if (target >= 0 && target < NUM_POINTS) {
      const destOwner = getPointOwner(points, target);
      if (destOwner !== opponent || getCheckerCount(points, target) < 2) {
        moves.push({ from: 'bar', to: target, dieUsed: dieValue });
      }
    }
    return moves; // Must enter from bar — no other moves allowed
  }

  // Regular moves on the board
  for (let i = 0; i < NUM_POINTS; i++) {
    if (points[i] * sign <= 0) continue; // No checker of this player here

    const target = calculateTarget(i, dieValue, player);

    if (target >= 0 && target < NUM_POINTS) {
      const destOwner = getPointOwner(points, target);
      if (destOwner !== opponent || getCheckerCount(points, target) < 2) {
        moves.push({ from: i, to: target, dieUsed: dieValue });
      }
    }
  }

  // Bear-off moves
  if (allInHomeBoard(points, bar, player)) {
    const bearOffMoves = getBearOffMoves(points, bar, player, dieValue);
    moves.push(...bearOffMoves);
  }

  return moves;
}

function removeDieFromList(movesRemaining: number[], die: number): number[] {
  const result = [...movesRemaining];
  const idx = result.indexOf(die);
  if (idx !== -1) result.splice(idx, 1);
  return result;
}

/**
 * Deduplicate turn sequences that produce the same final board state.
 */
function deduplicateByFinalState(
  sequences: TurnSequence[],
  originalPoints: BoardPoints,
  originalBar: BarState,
  originalBorneOff: BorneOffState,
  player: Player,
): TurnSequence[] {
  const seen = new Set<string>();
  const unique: TurnSequence[] = [];

  for (const seq of sequences) {
    let pts = originalPoints;
    let b = originalBar;
    let bo = originalBorneOff;

    for (const move of seq.moves) {
      const result = applyMove(pts, b, bo, player, move);
      pts = result.points;
      b = result.bar;
      bo = result.borneOff;
    }

    const key = JSON.stringify({ pts, b, bo });
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(seq);
    }
  }

  return unique;
}

/**
 * Get all legal moves for the current position (convenience for UI).
 * Returns flat list of legal single moves the player can make right now.
 */
export function getLegalMoves(
  points: BoardPoints,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  movesRemaining: number[],
): Move[] {
  if (movesRemaining.length === 0) return [];

  // Generate all legal turns to figure out which first moves are actually valid
  // (some first moves might block later moves, violating the "use both dice" rule)
  const allTurns = generateAllLegalTurns(points, bar, borneOff, player, movesRemaining);

  // Collect unique first moves from all valid turn sequences
  const firstMoves = new Map<string, Move>();
  for (const turn of allTurns) {
    if (turn.moves.length > 0) {
      const move = turn.moves[0];
      const key = `${move.from}-${move.to}-${move.dieUsed}`;
      if (!firstMoves.has(key)) {
        firstMoves.set(key, move);
      }
    }
  }

  return Array.from(firstMoves.values());
}
