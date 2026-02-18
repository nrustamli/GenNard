/**
 * Nardi (long backgammon) initial setup.
 * Positive = white checkers, Negative = black checkers.
 *
 * White moves from high index → low (toward index 0 / point 1).
 * Black moves from low index → high (toward index 23 / point 24).
 *
 * White: all 15 on point 24 (index 23) — farthest from home board (0-5)
 * Black: all 15 on point 1 (index 0) — farthest from home board (18-23)
 *
 * Index:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
 * Point:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
 */
export const INITIAL_BOARD: number[] = [
  -15, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 15,
];

export const NUM_POINTS = 24;
export const CHECKERS_PER_PLAYER = 15;

/** White home board: points 1-6 (indices 0-5) */
export const WHITE_HOME_START = 0;
export const WHITE_HOME_END = 5;

/** Black home board: points 19-24 (indices 18-23) */
export const BLACK_HOME_START = 18;
export const BLACK_HOME_END = 23;

/** Direction of movement */
export const DIRECTION = {
  white: -1, // high index → low index
  black: 1,  // low index → high index
} as const;
