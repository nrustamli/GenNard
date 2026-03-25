/**
 * HuggingFaceService.ts
 *
 * Drop-in replacement for LlmService + image generation, backed entirely by
 * open-source models served through the HuggingFace Inference API.
 *
 *  - Text / prompt interpretation : Qwen/Qwen2.5-72B-Instruct
 *  - Image generation             : black-forest-labs/FLUX.1-schnell
 *
 * Implements the same `interpretPrompt()` signature as LlmService so it can
 * be swapped into ThemeOrchestrator with no other changes.
 */

import { HfInference } from '@huggingface/inference';
import { z } from 'zod';
import type { StyleMode } from '../../../shared/themeTypes.js';

// ─── Schema (mirrors LlmService.LlmThemeResponseSchema) ─────────────────────

export const HfThemeResponseSchema = z.object({
  player1Theme: z.string(),
  player2Theme: z.string(),
  imagePrompts: z.object({
    checker1: z.string(),
    checker2: z.string(),
    board: z.string(),
  }),
  colors: z.object({
    boardDark: z.string(),
    boardLight: z.string(),
    boardFrame: z.string(),
    barColor: z.string(),
    bearOffColor: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    accentColor: z.string(),
    player1Accent: z.string(),
    player2Accent: z.string(),
  }),
});

export type HfThemeResponse = z.infer<typeof HfThemeResponseSchema>;

// ─── Prompts ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a backgammon board theme designer for GenNard, an AI-powered backgammon game.

Given a user's theme prompt and style mode, output a JSON theme object with two rival checker sets.

Rules:
1. player1Theme — theme name from the user's prompt (e.g. "Sushi")
2. player2Theme — a creative thematic RIVAL/opposite for player 2
   Examples: Sushi → Pizza, Cats → Dogs, Fire → Ice, Pirates → Ninjas, Space → Ocean
3. imagePrompts — detailed prompts for AI image generation:
   - checker1 (classic): "top-down view of a circular [theme] game piece, [details], transparent background, game asset, centered"
   - checker1 (creative): "top-down view of [theme object] as a game piece, transparent background, game asset, centered"
   - checker2: same format for the rival theme
   - board: "seamless [theme-appropriate surface] texture, top-down view, [mood/lighting]"
4. colors — 10 CSS hex colors complementing both themes

Return ONLY valid JSON — no markdown, no commentary:
{
  "player1Theme": "string",
  "player2Theme": "string",
  "imagePrompts": {
    "checker1": "string",
    "checker2": "string",
    "board": "string"
  },
  "colors": {
    "boardDark": "#hex",
    "boardLight": "#hex",
    "boardFrame": "#hex",
    "barColor": "#hex",
    "bearOffColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "accentColor": "#hex",
    "player1Accent": "#hex",
    "player2Accent": "#hex"
  }
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extracts a JSON object from text that may contain markdown fences or prose. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1) return text.slice(first, last + 1);
  return text.trim();
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class HuggingFaceService {
  private hf: HfInference;

  readonly textModel: string;
  readonly imageModel: string;

  constructor(
    token: string,
    options: {
      textModel?: string;
      imageModel?: string;
    } = {},
  ) {
    this.hf = new HfInference(token);
    this.textModel = options.textModel ?? 'Qwen/Qwen2.5-72B-Instruct';
    this.imageModel = options.imageModel ?? 'black-forest-labs/FLUX.1-schnell';
  }

  // ── Text: interpret prompt → theme config ─────────────────────────────────

  async interpretPrompt(prompt: string, styleMode: StyleMode): Promise<HfThemeResponse> {
    const response = await this.hf.chatCompletion({
      model: this.textModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Theme prompt: "${prompt}"\nStyle mode: ${styleMode}\n\nReturn the JSON theme.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 1024,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from HuggingFace LLM');

    const parsed = JSON.parse(extractJson(raw));
    return HfThemeResponseSchema.parse(parsed);
  }

  // ── Image: generate a checker image, return base64 data URL ──────────────

  async generateImageDataUrl(imagePrompt: string): Promise<string> {
    // outputType "dataUrl" returns a base64 data URL string directly
    return this.hf.textToImage(
      {
        model: this.imageModel,
        inputs: imagePrompt,
        parameters: {
          width: 512,
          height: 512,
          num_inference_steps: 4, // optimised for FLUX.1-schnell
        },
      },
      { outputType: 'dataUrl' },
    );
  }
}
