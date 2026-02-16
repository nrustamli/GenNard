import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ThemeGenerationResponse, StyleMode } from '../../../../shared/themeTypes.js';
import { LlmService } from './LlmService.js';
import { ImageService } from './ImageService.js';
import {
  getCacheKey,
  getCachedTheme,
  saveThemeToCache,
  ensureCacheDir,
  getImageUrl,
} from '../utils/imageCache.js';

export class ThemeOrchestrator {
  private llm: LlmService;
  private imageService: ImageService;

  constructor(apiKey: string) {
    this.llm = new LlmService(apiKey);
    this.imageService = new ImageService(apiKey);
  }

  async generate(prompt: string, styleMode: StyleMode): Promise<ThemeGenerationResponse> {
    const cacheKey = getCacheKey(prompt, styleMode);

    // 1. Check cache
    const cached = getCachedTheme(cacheKey);
    if (cached) {
      console.log(`Cache hit for "${prompt}" [${cacheKey}]`);
      return cached;
    }

    console.log(`Cache miss — generating theme for "${prompt}" [${cacheKey}]`);

    // 2. LLM call to interpret the prompt
    const llmResult = await this.llm.interpretPrompt(prompt, styleMode);

    // 3. Generate all 3 images in parallel
    const [checker1, checker2, board] = await Promise.all([
      this.imageService.generateImage(llmResult.imagePrompts.checker1),
      this.imageService.generateImage(llmResult.imagePrompts.checker2),
      this.imageService.generateImage(llmResult.imagePrompts.board),
    ]);

    // 4. Save images to disk
    const dir = ensureCacheDir(cacheKey);
    writeFileSync(join(dir, 'checker1.png'), checker1.data);
    writeFileSync(join(dir, 'checker2.png'), checker2.data);
    writeFileSync(join(dir, 'board.png'), board.data);

    // 5. Build response
    const response: ThemeGenerationResponse = {
      player1: {
        themeName: llmResult.player1Theme,
        checkerImageUrl: getImageUrl(cacheKey, 'checker1.png'),
      },
      player2: {
        themeName: llmResult.player2Theme,
        checkerImageUrl: getImageUrl(cacheKey, 'checker2.png'),
      },
      board: {
        textureUrl: getImageUrl(cacheKey, 'board.png'),
      },
      colors: llmResult.colors,
      metadata: {
        prompt,
        styleMode,
        generatedAt: new Date().toISOString(),
      },
    };

    // 6. Cache the JSON response
    saveThemeToCache(cacheKey, response);
    console.log(`Theme saved to cache [${cacheKey}]`);

    return response;
  }
}
