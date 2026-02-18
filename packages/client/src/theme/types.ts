import type { Texture } from 'three';

export interface ThemeColors {
  boardDark: string;
  boardLight: string;
  boardFrame: string;
  barColor: string;
  bearOffColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  player1Accent: string;
  player2Accent: string;
}

export interface ThemeTextures {
  checker1: Texture | null;
  checker2: Texture | null;
  board: Texture | null;
}

export interface ResolvedTheme {
  colors: ThemeColors;
  textures: ThemeTextures;
  player1Name: string;
  player2Name: string;
}
