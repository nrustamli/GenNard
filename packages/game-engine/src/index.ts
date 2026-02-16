// Types
export type {
  Player,
  BoardPoints,
  BarState,
  BorneOffState,
  DiceRoll,
  DiceState,
  GamePhase,
  DoublingCubeState,
  GameState,
  Move,
  RecordedMove,
  GameAction,
  EvaluationWeights,
  AiDifficulty,
} from './types.js';

// Board
export {
  createInitialBoard,
  createEmptyBar,
  createEmptyBorneOff,
  cloneBoard,
  cloneBar,
  cloneBorneOff,
  getPointOwner,
  getCheckerCount,
  playerSign,
  applyMove,
  calculateTarget,
  allInHomeBoard,
  calculatePipCount,
} from './Board.js';

// Dice
export {
  rollDice,
  createDiceRoll,
  getMovesFromRoll,
  removeDie,
} from './Dice.js';

// Move Validator
export { isLegalMove } from './MoveValidator.js';

// Move Generator
export {
  generateAllLegalTurns,
  getLegalMoves,
} from './MoveGenerator.js';
export type { TurnSequence } from './MoveGenerator.js';

// Bearing Off
export { canBearOff, getBearOffMoves } from './BearingOff.js';

// Game State
export {
  createNewGame,
  checkWinner,
  getWinType,
  switchPlayer,
} from './GameState.js';

// Game Reducer
export { gameReducer, applyDiceRoll } from './GameReducer.js';

// Constants
export {
  INITIAL_BOARD,
  NUM_POINTS,
  CHECKERS_PER_PLAYER,
  WHITE_HOME_START,
  WHITE_HOME_END,
  BLACK_HOME_START,
  BLACK_HOME_END,
  DIRECTION,
} from './constants.js';
