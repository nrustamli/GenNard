import { describe, it, expect } from 'vitest';
import {
  canBearOff,
  getBearOffMoves,
  createEmptyBar,
} from '../src/index.js';

describe('BearingOff', () => {
  describe('canBearOff', () => {
    it('returns true when all white checkers are in home board', () => {
      const board = new Array(24).fill(0);
      board[0] = 3;
      board[2] = 5;
      board[4] = 7;
      expect(canBearOff(board, createEmptyBar(), 'white')).toBe(true);
    });

    it('returns false when white has a checker outside home board', () => {
      const board = new Array(24).fill(0);
      board[0] = 3;
      board[2] = 5;
      board[10] = 1; // Outside home board
      expect(canBearOff(board, createEmptyBar(), 'white')).toBe(false);
    });

    it('returns true when all black checkers are in home board', () => {
      const board = new Array(24).fill(0);
      board[18] = -3;
      board[20] = -5;
      board[23] = -7;
      expect(canBearOff(board, createEmptyBar(), 'black')).toBe(true);
    });

    it('returns false when black has a checker outside home board', () => {
      const board = new Array(24).fill(0);
      board[18] = -3;
      board[10] = -1; // Outside home board
      expect(canBearOff(board, createEmptyBar(), 'black')).toBe(false);
    });
  });

  describe('getBearOffMoves', () => {
    it('returns exact bear off for white', () => {
      const board = new Array(24).fill(0);
      board[2] = 3; // White on pt3(idx2), distance = 3
      const moves = getBearOffMoves(board, createEmptyBar(), 'white', 3);
      expect(moves.length).toBe(1);
      expect(moves[0]).toEqual({ from: 2, to: 'off', dieUsed: 3 });
    });

    it('returns exact bear off for black', () => {
      const board = new Array(24).fill(0);
      board[21] = -3; // Black on pt22(idx21), distance = 24-21 = 3
      const moves = getBearOffMoves(board, createEmptyBar(), 'black', 3);
      expect(moves.length).toBe(1);
      expect(moves[0]).toEqual({ from: 21, to: 'off', dieUsed: 3 });
    });

    it('bears off from highest point when die is larger (white)', () => {
      const board = new Array(24).fill(0);
      board[1] = 2; // White on pt2(idx1), distance = 2
      board[0] = 3; // White on pt1(idx0), distance = 1
      // Die 6 — no checker at distance 6 (idx5), no checker higher than idx1
      const moves = getBearOffMoves(board, createEmptyBar(), 'white', 6);
      expect(moves.length).toBe(1);
      expect(moves[0].from).toBe(1); // Bear off from highest occupied point
    });

    it('does NOT bear off from lower point when higher point has checkers (white)', () => {
      const board = new Array(24).fill(0);
      board[4] = 2; // White on pt5(idx4), distance = 5
      board[1] = 3; // White on pt2(idx1), distance = 2
      // Die 3 — exact would be idx2, which is empty. But idx4 is higher, so can't bear off from idx1
      const moves = getBearOffMoves(board, createEmptyBar(), 'white', 3);
      expect(moves.length).toBe(0);
    });

    it('bears off from furthest point when die is larger (black)', () => {
      const board = new Array(24).fill(0);
      board[22] = -2; // Black on pt23(idx22), distance = 2
      board[23] = -3; // Black on pt24(idx23), distance = 1
      // Die 5 — no checker at distance 5 (idx19), no checker further than idx22
      const moves = getBearOffMoves(board, createEmptyBar(), 'black', 5);
      expect(moves.length).toBe(1);
      expect(moves[0].from).toBe(22); // Bear off from furthest occupied point
    });

    it('returns empty when not all in home board', () => {
      const board = new Array(24).fill(0);
      board[0] = 3;
      board[10] = 1; // Outside home board
      const moves = getBearOffMoves(board, createEmptyBar(), 'white', 3);
      expect(moves.length).toBe(0);
    });
  });
});
