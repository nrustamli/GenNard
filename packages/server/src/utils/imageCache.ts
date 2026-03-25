import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ThemeGenerationResponse } from '../../../shared/themeTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '../../generated');

export function getCacheKey(prompt: string, styleMode: string): string {
  return createHash('sha256')
    .update(`${prompt.toLowerCase().trim()}|${styleMode}`)
    .digest('hex')
    .slice(0, 16);
}

export function getCachedTheme(cacheKey: string): ThemeGenerationResponse | null {
  const themePath = join(GENERATED_DIR, cacheKey, 'theme.json');
  if (!existsSync(themePath)) return null;

  try {
    return JSON.parse(readFileSync(themePath, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveThemeToCache(cacheKey: string, theme: ThemeGenerationResponse): void {
  const dir = join(GENERATED_DIR, cacheKey);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(join(dir, 'theme.json'), JSON.stringify(theme, null, 2));
}
