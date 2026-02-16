import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ThemeGenerationResponse } from '../../../../shared/themeTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '../../generated');

export interface CachedThemeFiles {
  checker1Path: string;
  checker2Path: string;
  boardPath: string;
  cacheKey: string;
}

export function getCacheKey(prompt: string, styleMode: string): string {
  return createHash('sha256')
    .update(`${prompt.toLowerCase().trim()}|${styleMode}`)
    .digest('hex')
    .slice(0, 16);
}

export function getCachedTheme(cacheKey: string): ThemeGenerationResponse | null {
  const dir = join(GENERATED_DIR, cacheKey);
  const themePath = join(dir, 'theme.json');

  if (!existsSync(themePath)) return null;

  const checker1 = join(dir, 'checker1.png');
  const checker2 = join(dir, 'checker2.png');
  const board = join(dir, 'board.png');

  if (!existsSync(checker1) || !existsSync(checker2) || !existsSync(board)) return null;

  try {
    return JSON.parse(readFileSync(themePath, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveThemeToCache(cacheKey: string, theme: ThemeGenerationResponse): void {
  const dir = ensureCacheDir(cacheKey);
  writeFileSync(join(dir, 'theme.json'), JSON.stringify(theme, null, 2));
}

export function ensureCacheDir(cacheKey: string): string {
  const dir = join(GENERATED_DIR, cacheKey);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getImageUrl(cacheKey: string, filename: string): string {
  return `/api/generated/${cacheKey}/${filename}`;
}
