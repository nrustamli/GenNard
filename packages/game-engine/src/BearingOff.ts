import type { BoardPoints, BarState, Player, Move } from './types.js';
import { NUM_POINTS } from './constants.js';
import { allInHomeBoard, playerSign } from './Board.js';

export { allInHomeBoard as canBearOff };

/**
 * Generate all legal bear-off moves for a given die value.
 */
export function getBearOffMoves(
  points: BoardPoints,
  bar: BarState,
  player: Player,
  dieValue: number,
): Move[] {
  if (!allInHomeBoard(points, bar, player)) return [];

  const moves: Move[] = [];
  const sign = playerSign(player);

  if (player === 'white') {
    // White home board: indices 0-5, distance = index + 1
    const exactIndex = dieValue - 1; // index where distance == dieValue

    // Exact bear off
    if (exactIndex >= 0 && exactIndex <= 5 && points[exactIndex] * sign > 0) {
      moves.push({ from: exactIndex, to: 'off', dieUsed: dieValue });
    }

    // Bear off from highest occupied point if die is larger
    if (moves.length === 0) {
      // No exact match — check if we can bear off from the highest occupied point
      let hasHigher = false;
      for (let i = 5; i > exactIndex; i--) {
        if (points[i] * sign > 0) {
          hasHigher = true;
          break;
        }
      }

      if (!hasHigher) {
        // Die is larger than all occupied points — bear off from highest
        for (let i = exactIndex - 1; i >= 0; i--) {
          if (points[i] * sign > 0) {
            moves.push({ from: i, to: 'off', dieUsed: dieValue });
            break;
          }
        }
      }
    }
  } else {
    // Black home board: indices 18-23, distance = 24 - index
    const exactIndex = NUM_POINTS - dieValue; // index where distance == dieValue

    // Exact bear off
    if (exactIndex >= 18 && exactIndex <= 23 && points[exactIndex] * sign > 0) {
      moves.push({ from: exactIndex, to: 'off', dieUsed: dieValue });
    }

    // Bear off from furthest occupied point if die is larger
    if (moves.length === 0) {
      let hasFurther = false;
      for (let i = 18; i < exactIndex; i++) {
        if (points[i] * sign > 0) {
          hasFurther = true;
          break;
        }
      }

      if (!hasFurther) {
        for (let i = exactIndex + 1; i <= 23; i++) {
          if (points[i] * sign > 0) {
            moves.push({ from: i, to: 'off', dieUsed: dieValue });
            break;
          }
        }
      }
    }
  }

  return moves;
}
