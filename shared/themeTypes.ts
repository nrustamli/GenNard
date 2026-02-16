export type StyleMode = 'classic' | 'creative';

export interface ThemeGenerationRequest {
  prompt: string;
  styleMode: StyleMode;
}

export interface ThemeGenerationResponse {
  player1: {
    themeName: string;
    checkerImageUrl: string;
  };
  player2: {
    themeName: string;
    checkerImageUrl: string;
  };
  board: {
    textureUrl: string;
  };
  dice?: {
    textureUrl: string;
  };
  colors: {
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
  };
  metadata: {
    prompt: string;
    styleMode: StyleMode;
    generatedAt: string;
  };
}
