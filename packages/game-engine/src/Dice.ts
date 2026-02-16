import type { DiceRoll } from './types.js';

/** Roll two dice (1-6 each). */
export function rollDice(): DiceRoll {
  return {
    die1: Math.floor(Math.random() * 6) + 1,
    die2: Math.floor(Math.random() * 6) + 1,
  };
}

/** Create a specific dice roll (for testing). */
export function createDiceRoll(die1: number, die2: number): DiceRoll {
  return { die1, die2 };
}

/**
 * Get the list of available moves from a dice roll.
 * Doubles give 4 moves of the same value.
 */
export function getMovesFromRoll(roll: DiceRoll): number[] {
  if (roll.die1 === roll.die2) {
    return [roll.die1, roll.die1, roll.die1, roll.die1];
  }
  return [roll.die1, roll.die2];
}

/** Remove one die value from the remaining moves list. */
export function removeDie(movesRemaining: number[], dieUsed: number): number[] {
  const result = [...movesRemaining];
  const idx = result.indexOf(dieUsed);
  if (idx !== -1) {
    result.splice(idx, 1);
  }
  return result;
}
