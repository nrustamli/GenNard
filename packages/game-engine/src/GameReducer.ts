import type { GameState, GameAction, Move, RecordedMove } from './types.js';
import { applyMove, cloneBoard, cloneBar, cloneBorneOff } from './Board.js';
import { rollDice, getMovesFromRoll, removeDie } from './Dice.js';
import { checkWinner, getWinType, switchPlayer } from './GameState.js';
import { generateAllLegalTurns } from './MoveGenerator.js';

/**
 * Pure reducer: (state, action) => newState
 * Never mutates the original state.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ROLL_DICE':
      return handleRollDice(state, action.player);
    case 'MOVE_CHECKER':
      return handleMoveChecker(state, action.player, action.move);
    case 'CONFIRM_TURN':
      return handleConfirmTurn(state, action.player);
    case 'FORFEIT':
      return handleForfeit(state, action.player);
    default:
      return state;
  }
}

function handleRollDice(state: GameState, player: string): GameState {
  if (state.phase !== 'rolling') return state;
  if (state.currentPlayer !== player) return state;

  const roll = rollDice();
  const movesRemaining = getMovesFromRoll(roll);

  const newState: GameState = {
    ...state,
    dice: { roll, movesRemaining },
    phase: 'moving',
  };

  // Check if the player has any legal moves
  const turns = generateAllLegalTurns(
    newState.points,
    newState.bar,
    newState.borneOff,
    newState.currentPlayer,
    movesRemaining,
  );

  const hasLegalMoves = turns.some(t => t.moves.length > 0);
  if (!hasLegalMoves) {
    // No legal moves — automatically end the turn
    return {
      ...newState,
      currentPlayer: switchPlayer(newState.currentPlayer),
      dice: { roll: null, movesRemaining: [] },
      phase: 'rolling',
      turnNumber: newState.turnNumber + 1,
      moveHistory: [
        ...newState.moveHistory,
        { player: newState.currentPlayer, dice: roll, moves: [], turnNumber: newState.turnNumber },
      ],
    };
  }

  return newState;
}

function handleMoveChecker(state: GameState, player: string, move: Move): GameState {
  if (state.phase !== 'moving') return state;
  if (state.currentPlayer !== player) return state;

  // Apply the move
  const result = applyMove(state.points, state.bar, state.borneOff, state.currentPlayer, move);
  const newMovesRemaining = removeDie(state.dice.movesRemaining, move.dieUsed);

  const newState: GameState = {
    ...state,
    points: result.points,
    bar: result.bar,
    borneOff: result.borneOff,
    dice: { ...state.dice, movesRemaining: newMovesRemaining },
  };

  // Check for winner
  const winner = checkWinner(newState);
  if (winner) {
    return {
      ...newState,
      winner,
      winType: getWinType(newState, winner),
      phase: 'game_over',
    };
  }

  // If no more dice to use, auto-end the turn
  if (newMovesRemaining.length === 0) {
    return autoEndTurn(newState);
  }

  // Check if remaining dice have any legal moves
  const turns = generateAllLegalTurns(
    newState.points,
    newState.bar,
    newState.borneOff,
    newState.currentPlayer,
    newMovesRemaining,
  );

  const hasLegalMoves = turns.some(t => t.moves.length > 0);
  if (!hasLegalMoves) {
    return autoEndTurn(newState);
  }

  return newState;
}

function autoEndTurn(state: GameState): GameState {
  return {
    ...state,
    currentPlayer: switchPlayer(state.currentPlayer),
    dice: { roll: null, movesRemaining: [] },
    phase: 'rolling',
    turnNumber: state.turnNumber + 1,
  };
}

function handleConfirmTurn(state: GameState, player: string): GameState {
  if (state.currentPlayer !== player) return state;
  if (state.phase !== 'moving') return state;

  return autoEndTurn(state);
}

function handleForfeit(state: GameState, player: string): GameState {
  const winner = switchPlayer(player as 'white' | 'black');
  return {
    ...state,
    winner,
    winType: 'normal',
    phase: 'game_over',
  };
}

/**
 * Apply a specific dice roll (for server-authoritative mode and testing).
 */
export function applyDiceRoll(state: GameState, die1: number, die2: number): GameState {
  if (state.phase !== 'rolling') return state;

  const roll = { die1, die2 };
  const movesRemaining = getMovesFromRoll(roll);

  const newState: GameState = {
    ...state,
    dice: { roll, movesRemaining },
    phase: 'moving',
  };

  const turns = generateAllLegalTurns(
    newState.points,
    newState.bar,
    newState.borneOff,
    newState.currentPlayer,
    movesRemaining,
  );

  const hasLegalMoves = turns.some(t => t.moves.length > 0);
  if (!hasLegalMoves) {
    return {
      ...newState,
      currentPlayer: switchPlayer(newState.currentPlayer),
      dice: { roll: null, movesRemaining: [] },
      phase: 'rolling',
      turnNumber: newState.turnNumber + 1,
    };
  }

  return newState;
}
