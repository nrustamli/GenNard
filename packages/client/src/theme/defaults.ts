import type { ThemeColors, ResolvedTheme } from './types';

export const DEFAULT_COLORS: ThemeColors = {
  boardDark: '#743500',
  boardLight: '#DEB887',
  boardFrame: '#694934',
  barColor: '#694934',
  bearOffColor: '#694934',
  backgroundColor: '#eeeeee',
  textColor: '#2a2a2a',
  accentColor: '#694934',
  player1Accent: '#f5f5dc',
  player2Accent: '#1a1a1a',
};

export const DEFAULT_THEME: ResolvedTheme = {
  colors: DEFAULT_COLORS,
  textures: { checker1: null, checker2: null, board: null },
  player1Name: 'White',
  player2Name: 'Black',
};
