import { useCallback } from 'react';
import type { StyleMode } from '../../../../shared/themeTypes';
import { useThemeStore } from '../store/themeStore';

export function useThemeGeneration() {
  const { response, status, error, generate, reset } = useThemeStore();

  const startGeneration = useCallback(
    (prompt: string, styleMode: StyleMode) => generate(prompt, styleMode),
    [generate],
  );

  return {
    theme: response,
    isLoading: status === 'loading',
    isReady: status === 'ready',
    isError: status === 'error',
    error,
    startGeneration,
    reset,
  };
}
