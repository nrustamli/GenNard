import { describe, it, expect } from 'vitest';
import {
  createInitialBoard,
  createEmptyBar,
  createEmptyBorneOff,
  getPointOwner,
  getCheckerCount,
  applyMove,
  allInHomeBoard,
  calculatePipCount,
} from '../src/index.js';

describe('Board', () => {
  describe('createInitialBoard', () => {
    it('creates a board with 15 checkers per player', () => {
      const board = createInitialBoard();
      expect(board.length).toBe(24);

      const whiteTotal = board.filter(v => v > 0).reduce((sum, v) => sum + v, 0);
      const blackTotal = board.filter(v => v < 0).reduce((sum, v) => sum + Math.abs(v), 0);
      expect(whiteTotal).toBe(15);
      expect(blackTotal).toBe(15);
    });

    it('has correct standard positions', () => {
      const board = createInitialBoard();
      // White: 5 on pt6(idx5), 3 on pt8(idx7), 5 on pt13(idx12), 2 on pt24(idx23)
      expect(board[5]).toBe(5);
      expect(board[7]).toBe(3);
      expect(board[12]).toBe(5);
      expect(board[23]).toBe(2);

      // Black: 2 on pt1(idx0), 5 on pt12(idx11), 3 on pt17(idx16), 5 on pt19(idx18)
      expect(board[0]).toBe(-2);
      expect(board[11]).toBe(-5);
      expect(board[16]).toBe(-3);
      expect(board[18]).toBe(-5);
    });
  });

  describe('getPointOwner', () => {
    it('returns correct owner', () => {
      const board = createInitialBoard();
      expect(getPointOwner(board, 5)).toBe('white');
      expect(getPointOwner(board, 0)).toBe('black');
      expect(getPointOwner(board, 1)).toBe(null);
    });
  });

  describe('getCheckerCount', () => {
    it('returns absolute count', () => {
      const board = createInitialBoard();
      expect(getCheckerCount(board, 5)).toBe(5);
      expect(getCheckerCount(board, 0)).toBe(2);
      expect(getCheckerCount(board, 1)).toBe(0);
    });
  });

  describe('applyMove', () => {
    it('moves a white checker forward', () => {
      const board = createInitialBoard();
      const bar = createEmptyBar();
      const borneOff = createEmptyBorneOff();

      // White moves from pt24(idx23) by 1 to pt23(idx22)
      const result = applyMove(board, bar, borneOff, 'white', {
        from: 23,
        to: 22,
        dieUsed: 1,
      });

      expect(result.points[23]).toBe(1); // was 2, now 1
      expect(result.points[22]).toBe(1); // was 0, now 1
      expect(result.hit).toBe(false);
    });

    it('moves a black checker forward', () => {
      const board = createInitialBoard();
      const bar = createEmptyBar();
      const borneOff = createEmptyBorneOff();

      // Black moves from pt1(idx0) by 2 to pt3(idx2)
      const result = applyMove(board, bar, borneOff, 'black', {
        from: 0,
        to: 2,
        dieUsed: 2,
      });

      expect(result.points[0]).toBe(-1); // was -2, now -1
      expect(result.points[2]).toBe(-1); // was 0, now -1
      expect(result.hit).toBe(false);
    });

    it('hits an opponent blot', () => {
      const board = createInitialBoard();
      board[22] = -1; // Place a single black checker on pt23(idx22)
      const bar = createEmptyBar();
      const borneOff = createEmptyBorneOff();

      // White moves from pt24(idx23) to pt23(idx22) with die 1
      const result = applyMove(board, bar, borneOff, 'white', {
        from: 23,
        to: 22,
        dieUsed: 1,
      });

      expect(result.points[22]).toBe(1); // White occupies
      expect(result.bar.black).toBe(1); // Black sent to bar
      expect(result.hit).toBe(true);
    });

    it('enters white from bar', () => {
      const board = new Array(24).fill(0);
      const bar = { white: 1, black: 0 };
      const borneOff = createEmptyBorneOff();

      // White enters from bar with die 3 → pt22(idx21)
      const result = applyMove(board, bar, borneOff, 'white', {
        from: 'bar',
        to: 21,
        dieUsed: 3,
      });

      expect(result.bar.white).toBe(0);
      expect(result.points[21]).toBe(1);
    });

    it('enters black from bar', () => {
      const board = new Array(24).fill(0);
      const bar = { white: 0, black: 1 };
      const borneOff = createEmptyBorneOff();

      // Black enters from bar with die 4 → pt4(idx3)
      const result = applyMove(board, bar, borneOff, 'black', {
        from: 'bar',
        to: 3,
        dieUsed: 4,
      });

      expect(result.bar.black).toBe(0);
      expect(result.points[3]).toBe(-1);
    });

    it('bears off a checker', () => {
      const board = new Array(24).fill(0);
      board[3] = 1; // White on pt4(idx3)
      const bar = createEmptyBar();
      const borneOff = createEmptyBorneOff();

      const result = applyMove(board, bar, borneOff, 'white', {
        from: 3,
        to: 'off',
        dieUsed: 4,
      });

      expect(result.points[3]).toBe(0);
      expect(result.borneOff.white).toBe(1);
    });
  });

  describe('allInHomeBoard', () => {
    it('returns false for initial position', () => {
      expect(allInHomeBoard(createInitialBoard(), createEmptyBar(), 'white')).toBe(false);
      expect(allInHomeBoard(createInitialBoard(), createEmptyBar(), 'black')).toBe(false);
    });

    it('returns true when all white checkers are in home board (indices 0-5)', () => {
      const board = new Array(24).fill(0);
      board[0] = 5;
      board[2] = 5;
      board[4] = 5;
      expect(allInHomeBoard(board, createEmptyBar(), 'white')).toBe(true);
    });

    it('returns true when all black checkers are in home board (indices 18-23)', () => {
      const board = new Array(24).fill(0);
      board[18] = -5;
      board[20] = -5;
      board[22] = -5;
      expect(allInHomeBoard(board, createEmptyBar(), 'black')).toBe(true);
    });

    it('returns false when checker is on bar', () => {
      const board = new Array(24).fill(0);
      board[0] = 4;
      const bar = { white: 1, black: 0 };
      expect(allInHomeBoard(board, bar, 'white')).toBe(false);
    });
  });

  describe('calculatePipCount', () => {
    it('calculates 167 for each player at initial position', () => {
      const board = createInitialBoard();
      const bar = createEmptyBar();
      // Standard backgammon starting pip count is 167
      expect(calculatePipCount(board, bar, 'white')).toBe(167);
      expect(calculatePipCount(board, bar, 'black')).toBe(167);
    });

    it('adds 25 pips per bar checker', () => {
      const board = new Array(24).fill(0);
      const bar = { white: 2, black: 0 };
      expect(calculatePipCount(board, bar, 'white')).toBe(50);
    });
  });
});
