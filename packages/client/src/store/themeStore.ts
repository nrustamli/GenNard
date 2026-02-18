import { create } from 'zustand';
import type { ThemeGenerationResponse, StyleMode } from '../../../../shared/themeTypes';
import { generateTheme } from '../services/themeApi';

interface ThemeState {
  response: ThemeGenerationResponse | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  generate: (prompt: string, styleMode: StyleMode) => Promise<void>;
  reset: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  response: null,
  status: 'idle',
  error: null,

  generate: async (prompt, styleMode) => {
    set({ status: 'loading', error: null });
    try {
      const response = await generateTheme({ prompt, styleMode });
      set({ response, status: 'ready' });
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Theme generation failed',
      });
    }
  },

  reset: () => set({ response: null, status: 'idle', error: null }),
}));
