import type { GameState, Player, DiceRoll } from './types.js';
import { createInitialBoard, createEmptyBar, createEmptyBorneOff } from './Board.js';
import { CHECKERS_PER_PLAYER } from './constants.js';

let idCounter = 0;

export function createNewGame(id?: string): GameState {
  return {
    id: id ?? `game-${++idCounter}`,
    points: createInitialBoard(),
    bar: createEmptyBar(),
    borneOff: createEmptyBorneOff(),
    currentPlayer: 'white',
    dice: { roll: null, movesRemaining: [] },
    phase: 'rolling',
    doublingCube: { value: 1, owner: null, lastDoubler: null },
    turnNumber: 0,
    winner: null,
    winType: null,
    moveHistory: [],
  };
}

export function checkWinner(state: GameState): Player | null {
  if (state.borneOff.white === CHECKERS_PER_PLAYER) return 'white';
  if (state.borneOff.black === CHECKERS_PER_PLAYER) return 'black';
  return null;
}

export function getWinType(state: GameState, winner: Player): 'normal' | 'gammon' | 'backgammon' {
  const loser: Player = winner === 'white' ? 'black' : 'white';

  // Backgammon: loser has borne off zero AND has a checker on the bar or in winner's home board
  if (state.borneOff[loser] === 0) {
    const hasCheckerInWinnerHome = winner === 'white'
      ? hasCheckersInRange(state, loser, 0, 5) || state.bar[loser] > 0
      : hasCheckersInRange(state, loser, 18, 23) || state.bar[loser] > 0;

    if (hasCheckerInWinnerHome) return 'backgammon';
    return 'gammon';
  }

  return 'normal';
}

function hasCheckersInRange(state: GameState, player: Player, start: number, end: number): boolean {
  const sign = player === 'white' ? 1 : -1;
  for (let i = start; i <= end; i++) {
    if (state.points[i] * sign > 0) return true;
  }
  return false;
}

export function switchPlayer(player: Player): Player {
  return player === 'white' ? 'black' : 'white';
}
