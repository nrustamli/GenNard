/**
 * HuggingFaceOrchestrator.ts
 *
 * Drop-in replacement for ThemeOrchestrator using open-source HF models:
 *   - Text  : Qwen/Qwen2.5-72B-Instruct
 *   - Images: black-forest-labs/FLUX.1-schnell
 *
 * Implements the same generate() signature so it can be swapped in index.ts.
 */

import type { ThemeGenerationResponse, StyleMode } from '../../../shared/themeTypes.js';
import { HuggingFaceService } from './HuggingFaceService.js';
import { getCacheKey, getCachedTheme, saveThemeToCache } from '../utils/imageCache.js';

export class HuggingFaceOrchestrator {
  private hf: HuggingFaceService;

  constructor(token: string) {
    this.hf = new HuggingFaceService(token);
    console.log(`[HF] Text model : ${this.hf.textModel}`);
    console.log(`[HF] Image model: ${this.hf.imageModel}`);
  }

  async generate(prompt: string, styleMode: StyleMode): Promise<ThemeGenerationResponse> {
    const cacheKey = getCacheKey(prompt, styleMode);

    // 1. Check cache
    const cached = getCachedTheme(cacheKey);
    if (cached) {
      console.log(`[HF] Cache hit for "${prompt}" [${cacheKey}]`);
      return cached;
    }

    console.log(`[HF] Cache miss — generating theme for "${prompt}" [${cacheKey}]`);

    // 2. LLM interprets the prompt
    const llmResult = await this.hf.interpretPrompt(prompt, styleMode);
    console.log(`[HF] Player 1: ${llmResult.player1Theme} | Player 2: ${llmResult.player2Theme}`);

    // 3. Generate all 3 images in parallel
    console.log('[HF] Generating 3 images in parallel (may take 15–40s)...');
    const [checker1Url, checker2Url, boardUrl] = await Promise.all([
      this.hf.generateImageDataUrl(llmResult.imagePrompts.checker1),
      this.hf.generateImageDataUrl(llmResult.imagePrompts.checker2),
      this.hf.generateImageDataUrl(llmResult.imagePrompts.board),
    ]);

    // 4. Build response
    const response: ThemeGenerationResponse = {
      player1: { themeName: llmResult.player1Theme, checkerImageUrl: checker1Url },
      player2: { themeName: llmResult.player2Theme, checkerImageUrl: checker2Url },
      board: { textureUrl: boardUrl },
      colors: llmResult.colors,
      metadata: { prompt, styleMode, generatedAt: new Date().toISOString() },
    };

    // 5. Cache it
    saveThemeToCache(cacheKey, response);
    console.log(`[HF] Theme cached [${cacheKey}]`);

    return response;
  }
}
