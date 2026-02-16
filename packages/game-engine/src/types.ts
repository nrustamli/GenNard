export type Player = 'white' | 'black';

/**
 * Board: 24-element array.
 * Positive values = white checkers, Negative = black checkers.
 * Index 0 = point 1 (white's home board), Index 23 = point 24 (black's home board).
 *
 * White moves from high index → low index (toward point 1).
 * Black moves from low index → high index (toward point 24).
 */
export type BoardPoints = number[];

export interface BarState {
  white: number;
  black: number;
}

export interface BorneOffState {
  white: number;
  black: number;
}

export interface DiceRoll {
  die1: number;
  die2: number;
}

export interface DiceState {
  roll: DiceRoll | null;
  movesRemaining: number[];
}

export type GamePhase =
  | 'waiting_for_players'
  | 'rolling_for_first'
  | 'rolling'
  | 'moving'
  | 'game_over';

export interface DoublingCubeState {
  value: number;
  owner: Player | null;
  lastDoubler: Player | null;
}

export interface GameState {
  id: string;
  points: BoardPoints;
  bar: BarState;
  borneOff: BorneOffState;
  currentPlayer: Player;
  dice: DiceState;
  phase: GamePhase;
  doublingCube: DoublingCubeState;
  turnNumber: number;
  winner: Player | null;
  winType: 'normal' | 'gammon' | 'backgammon' | null;
  moveHistory: RecordedMove[];
}

export interface Move {
  from: number | 'bar';
  to: number | 'off';
  dieUsed: number;
}

export interface RecordedMove {
  player: Player;
  dice: DiceRoll;
  moves: Move[];
  turnNumber: number;
}

export type GameAction =
  | { type: 'ROLL_DICE'; player: Player }
  | { type: 'MOVE_CHECKER'; player: Player; move: Move }
  | { type: 'UNDO_MOVE'; player: Player }
  | { type: 'CONFIRM_TURN'; player: Player }
  | { type: 'OFFER_DOUBLE'; player: Player }
  | { type: 'ACCEPT_DOUBLE'; player: Player }
  | { type: 'REJECT_DOUBLE'; player: Player }
  | { type: 'FORFEIT'; player: Player };

export interface EvaluationWeights {
  pipCount: number;
  blotExposure: number;
  blockadeStrength: number;
  anchorStrength: number;
  homeBoardStrength: number;
  barPenalty: number;
  bearOffProgress: number;
  primeLength: number;
}

export interface AiDifficulty {
  name: string;
  weights: EvaluationWeights;
  randomnessFactor: number;
}
