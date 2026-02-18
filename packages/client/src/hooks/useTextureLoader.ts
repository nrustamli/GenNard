import { useEffect, useState } from 'react';
import { TextureLoader, SRGBColorSpace, type Texture } from 'three';
import type { ResolvedTheme } from '../theme/types';
import { DEFAULT_THEME } from '../theme/defaults';
import { useThemeStore } from '../store/themeStore';

const loader = new TextureLoader();

function loadTexture(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      reject,
    );
  });
}

export function useTextureLoader(): ResolvedTheme {
  const response = useThemeStore((s) => s.response);
  const [resolved, setResolved] = useState<ResolvedTheme>(DEFAULT_THEME);

  useEffect(() => {
    if (!response) {
      setResolved(DEFAULT_THEME);
      return;
    }

    let cancelled = false;

    const urls = [
      response.player1.checkerImageUrl,
      response.player2.checkerImageUrl,
      response.board.textureUrl,
    ];

    Promise.all(urls.map((u) => loadTexture(u).catch(() => null))).then(
      ([checker1, checker2, board]) => {
        if (cancelled) return;
        setResolved({
          colors: response.colors,
          textures: { checker1, checker2, board },
          player1Name: response.player1.themeName,
          player2Name: response.player2.themeName,
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [response]);

  return resolved;
}
