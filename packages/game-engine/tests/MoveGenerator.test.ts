import { describe, it, expect } from 'vitest';
import {
  generateAllLegalTurns,
  getLegalMoves,
  createEmptyBar,
  createEmptyBorneOff,
} from '../src/index.js';

describe('MoveGenerator', () => {
  describe('generateAllLegalTurns', () => {
    it('generates moves from initial position', () => {
      const board = [
        -2,  0,  0,  0,  0,  5,
         0,  3,  0,  0,  0, -5,
         5,  0,  0,  0, -3,  0,
        -5,  0,  0,  0,  0,  2,
      ];
      const bar = createEmptyBar();
      const borneOff = createEmptyBorneOff();

      // White rolls 3-1
      const turns = generateAllLegalTurns(board, bar, borneOff, 'white', [3, 1]);
      expect(turns.length).toBeGreaterThan(0);

      // All turns should use both dice (2 moves each)
      for (const turn of turns) {
        expect(turn.moves.length).toBe(2);
      }
    });

    it('handles doubles (4 moves)', () => {
      const board = [
        -2,  0,  0,  0,  0,  5,
         0,  3,  0,  0,  0, -5,
         5,  0,  0,  0, -3,  0,
        -5,  0,  0,  0,  0,  2,
      ];
      const bar = createEmptyBar();
      const borneOff = createEmptyBorneOff();

      // White rolls double 6s
      const turns = generateAllLegalTurns(board, bar, borneOff, 'white', [6, 6, 6, 6]);
      expect(turns.length).toBeGreaterThan(0);
    });

    it('forces bar entry first', () => {
      const board = new Array(24).fill(0);
      board[5] = 5;  // White checkers on pt6
      board[12] = 5; // White on pt13
      const bar = { white: 1, black: 0 };
      const borneOff = createEmptyBorneOff();

      const turns = generateAllLegalTurns(board, bar, borneOff, 'white', [3, 1]);

      // Every turn must start with entering from bar
      for (const turn of turns) {
        expect(turn.moves[0].from).toBe('bar');
      }
    });

    it('returns empty move turn when completely blocked', () => {
      // White has one checker on bar, but all entry points are blocked by black
      const board = new Array(24).fill(0);
      board[18] = -2; // Black blocks pt19(idx18)
      board[19] = -2; // Black blocks pt20(idx19)
      board[20] = -2; // Black blocks pt21(idx20)
      board[21] = -2; // Black blocks pt22(idx21)
      board[22] = -2; // Black blocks pt23(idx22)
      board[23] = -2; // Black blocks pt24(idx23)

      const bar = { white: 1, black: 0 };
      const borneOff = createEmptyBorneOff();

      const turns = generateAllLegalTurns(board, bar, borneOff, 'white', [3, 1]);

      // Should return a single turn with no moves (blocked)
      expect(turns.length).toBe(1);
      expect(turns[0].moves.length).toBe(0);
    });

    it('forces using larger die when only one can be used', () => {
      // Setup where white can use a 5 but not a 2 (or can use 2 but not 5)
      const board = new Array(24).fill(0);
      board[5] = 1;   // White on pt6(idx5)
      // Block all points near pt6 except pt1(idx0) which is 5 away
      board[3] = -2;  // Black blocks pt4(idx3) — die 2 target
      board[4] = -2;  // Black blocks pt5(idx4) — die 1 target

      const bar = createEmptyBar();
      const borneOff = createEmptyBorneOff();

      // Die 5: pt6→pt1(idx5→idx0) = valid
      // Die 2: pt6→pt4(idx5→idx3) = blocked
      const turns = generateAllLegalTurns(board, bar, borneOff, 'white', [5, 2]);

      // Should only use die 5 (the larger one)
      for (const turn of turns) {
        if (turn.moves.length > 0) {
          expect(turn.moves[0].dieUsed).toBe(5);
        }
      }
    });
  });

  describe('getLegalMoves', () => {
    it('returns valid first moves from initial position', () => {
      const board = [
        -2,  0,  0,  0,  0,  5,
         0,  3,  0,  0,  0, -5,
         5,  0,  0,  0, -3,  0,
        -5,  0,  0,  0,  0,  2,
      ];
      const bar = createEmptyBar();
      const borneOff = createEmptyBorneOff();

      const moves = getLegalMoves(board, bar, borneOff, 'white', [6, 1]);
      expect(moves.length).toBeGreaterThan(0);

      // All moves should be for white (from points with white checkers)
      for (const move of moves) {
        if (move.from !== 'bar') {
          expect(board[move.from]).toBeGreaterThan(0);
        }
      }
    });

    it('returns empty array when no dice remaining', () => {
      const board = createEmptyBoard();
      const moves = getLegalMoves(board, createEmptyBar(), createEmptyBorneOff(), 'white', []);
      expect(moves.length).toBe(0);
    });
  });
});

function createEmptyBoard(): number[] {
  return new Array(24).fill(0);
}
