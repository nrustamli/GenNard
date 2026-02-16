import { describe, it, expect } from 'vitest';
import {
  createNewGame,
  checkWinner,
  getWinType,
  switchPlayer,
  gameReducer,
  applyDiceRoll,
  CHECKERS_PER_PLAYER,
} from '../src/index.js';

describe('GameState', () => {
  describe('createNewGame', () => {
    it('creates a game in rolling phase', () => {
      const game = createNewGame('test-1');
      expect(game.id).toBe('test-1');
      expect(game.phase).toBe('rolling');
      expect(game.currentPlayer).toBe('white');
      expect(game.winner).toBe(null);
      expect(game.turnNumber).toBe(0);
      expect(game.bar.white).toBe(0);
      expect(game.bar.black).toBe(0);
      expect(game.borneOff.white).toBe(0);
      expect(game.borneOff.black).toBe(0);
    });
  });

  describe('checkWinner', () => {
    it('returns null when no one has won', () => {
      const game = createNewGame();
      expect(checkWinner(game)).toBe(null);
    });

    it('returns white when all 15 white checkers borne off', () => {
      const game = createNewGame();
      game.borneOff.white = CHECKERS_PER_PLAYER;
      expect(checkWinner(game)).toBe('white');
    });

    it('returns black when all 15 black checkers borne off', () => {
      const game = createNewGame();
      game.borneOff.black = CHECKERS_PER_PLAYER;
      expect(checkWinner(game)).toBe('black');
    });
  });

  describe('getWinType', () => {
    it('returns normal when loser has borne off some checkers', () => {
      const game = createNewGame();
      game.borneOff.white = CHECKERS_PER_PLAYER;
      game.borneOff.black = 3;
      // Clear board of black checkers for consistency
      game.points = new Array(24).fill(0);
      game.bar.black = 0;
      expect(getWinType(game, 'white')).toBe('normal');
    });

    it('returns gammon when loser has borne off zero and no checkers in winner home', () => {
      const game = createNewGame();
      game.borneOff.white = CHECKERS_PER_PLAYER;
      game.borneOff.black = 0;
      game.points = new Array(24).fill(0);
      game.points[10] = -15; // All black checkers in the middle
      game.bar.black = 0;
      expect(getWinType(game, 'white')).toBe('gammon');
    });

    it('returns backgammon when loser has checker on bar', () => {
      const game = createNewGame();
      game.borneOff.white = CHECKERS_PER_PLAYER;
      game.borneOff.black = 0;
      game.points = new Array(24).fill(0);
      game.points[10] = -14;
      game.bar.black = 1;
      expect(getWinType(game, 'white')).toBe('backgammon');
    });

    it('returns backgammon when loser has checker in winner home board', () => {
      const game = createNewGame();
      game.borneOff.white = CHECKERS_PER_PLAYER;
      game.borneOff.black = 0;
      game.points = new Array(24).fill(0);
      game.points[10] = -14;
      game.points[3] = -1; // Black checker in white's home board (indices 0-5)
      game.bar.black = 0;
      expect(getWinType(game, 'white')).toBe('backgammon');
    });
  });

  describe('switchPlayer', () => {
    it('switches white to black', () => {
      expect(switchPlayer('white')).toBe('black');
    });

    it('switches black to white', () => {
      expect(switchPlayer('black')).toBe('white');
    });
  });
});

describe('GameReducer', () => {
  describe('applyDiceRoll', () => {
    it('sets dice and transitions to moving phase', () => {
      const game = createNewGame();
      const result = applyDiceRoll(game, 3, 5);
      expect(result.dice.roll).toEqual({ die1: 3, die2: 5 });
      expect(result.dice.movesRemaining).toEqual([3, 5]);
      expect(result.phase).toBe('moving');
    });

    it('handles doubles', () => {
      const game = createNewGame();
      const result = applyDiceRoll(game, 4, 4);
      expect(result.dice.movesRemaining).toEqual([4, 4, 4, 4]);
    });

    it('does nothing if not in rolling phase', () => {
      const game = createNewGame();
      game.phase = 'moving';
      const result = applyDiceRoll(game, 3, 5);
      expect(result.phase).toBe('moving');
      expect(result.dice.roll).toBe(null);
    });
  });

  describe('MOVE_CHECKER action', () => {
    it('applies a valid move', () => {
      const game = createNewGame();
      const rolled = applyDiceRoll(game, 6, 1);

      // White moves from pt24(idx23) by 1 to pt23(idx22)
      const result = gameReducer(rolled, {
        type: 'MOVE_CHECKER',
        player: 'white',
        move: { from: 23, to: 22, dieUsed: 1 },
      });

      expect(result.points[23]).toBe(1); // Was 2, now 1
      expect(result.points[22]).toBe(1); // Was 0, now 1
      expect(result.dice.movesRemaining).toEqual([6]); // Used the 1
    });

    it('ignores move from wrong player', () => {
      const game = createNewGame();
      const rolled = applyDiceRoll(game, 3, 1);

      const result = gameReducer(rolled, {
        type: 'MOVE_CHECKER',
        player: 'black',
        move: { from: 0, to: 1, dieUsed: 1 },
      });

      // State should not change
      expect(result).toEqual(rolled);
    });
  });

  describe('FORFEIT action', () => {
    it('ends the game with opponent as winner', () => {
      const game = createNewGame();
      const result = gameReducer(game, { type: 'FORFEIT', player: 'white' });
      expect(result.winner).toBe('black');
      expect(result.phase).toBe('game_over');
    });
  });
});
