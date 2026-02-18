import { GoogleGenAI, Modality } from '@google/genai';
import type { ThemeGenerationResponse, StyleMode } from '../../../../shared/themeTypes.js';
import { LlmService } from './LlmService.js';
import {
  getCacheKey,
  getCachedTheme,
  saveThemeToCache,
} from '../utils/imageCache.js';

async function generateImageDataUrl(ai: GoogleGenAI, prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No content parts in image response');

  for (const part of parts) {
    if (part.inlineData?.data) {
      const mime = part.inlineData.mimeType ?? 'image/png';
      return `data:${mime};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image data found in Gemini response');
}

export class ThemeOrchestrator {
  private llm: LlmService;
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.llm = new LlmService(apiKey);
    this.ai = new GoogleGenAI({ apiKey });
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

    // 3. Generate all 3 images in parallel, return as data URLs
    const [checker1Url, checker2Url, boardUrl] = await Promise.all([
      generateImageDataUrl(this.ai, llmResult.imagePrompts.checker1),
      generateImageDataUrl(this.ai, llmResult.imagePrompts.checker2),
      generateImageDataUrl(this.ai, llmResult.imagePrompts.board),
    ]);

    // 4. Build response
    const response: ThemeGenerationResponse = {
      player1: {
        themeName: llmResult.player1Theme,
        checkerImageUrl: checker1Url,
      },
      player2: {
        themeName: llmResult.player2Theme,
        checkerImageUrl: checker2Url,
      },
      board: {
        textureUrl: boardUrl,
      },
      colors: llmResult.colors,
      metadata: {
        prompt,
        styleMode,
        generatedAt: new Date().toISOString(),
      },
    };

    // 5. Cache the JSON response (data URLs are self-contained)
    saveThemeToCache(cacheKey, response);
    console.log(`Theme saved to cache [${cacheKey}]`);

    return response;
  }
}
