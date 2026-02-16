import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import type { StyleMode } from '../../../../shared/themeTypes.js';

export const LlmThemeResponseSchema = z.object({
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

export type LlmThemeResponse = z.infer<typeof LlmThemeResponseSchema>;

const SYSTEM_PROMPT = `You are a backgammon board theme designer for GenNard.

Given a user's theme prompt and style mode, generate:

1. **Player 1 theme name** — based directly on the user's prompt
2. **Player 2 theme name** — a creative thematic RIVAL/opposite
   - Examples: Sushi → Pizza, Cats → Dogs, Fire → Ice, Pirates → Ninjas,
     Space → Ocean, Angels → Demons, Summer → Winter
   - The rival should feel like a natural, fun opponent
3. **Image generation prompts** — optimized for AI image generation:
   - checker1: "top-down view of a circular [theme] game piece, [style details],
     on transparent background, game asset style, clean edges, centered composition"
   - checker2: same format for the rival theme
   - board: "seamless [theme-appropriate surface] texture, top-down view, [mood/lighting]"
4. **Color palette** — 10 CSS hex colors that complement the generated images

Style mode affects image prompts:
- "classic": Checkers should be round disc-shaped, theme applied as surface decoration
- "creative": Checkers can be any shape/form that represents the theme

Return valid JSON matching the provided schema.`;

const jsonSchema = zodToJsonSchema(LlmThemeResponseSchema, {
  $refStrategy: 'none',
});

export class LlmService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async interpretPrompt(prompt: string, styleMode: StyleMode): Promise<LlmThemeResponse> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Theme prompt: "${prompt}"\nStyle mode: ${styleMode}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseJsonSchema: jsonSchema,
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from LLM');
    }

    const parsed = JSON.parse(text);
    return LlmThemeResponseSchema.parse(parsed);
  }
}
