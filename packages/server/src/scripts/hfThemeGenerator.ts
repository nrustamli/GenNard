/**
 * hfThemeGenerator.ts
 *
 * Standalone script: interprets a theme prompt using an open-source HuggingFace
 * LLM (Qwen2.5-72B-Instruct), then generates 2 checker images using FLUX.1-schnell.
 *
 * Usage:
 *   HF_TOKEN=hf_xxx npx tsx src/scripts/hfThemeGenerator.ts "<prompt>" [classic|creative]
 *
 * Examples:
 *   HF_TOKEN=hf_xxx npx tsx src/scripts/hfThemeGenerator.ts "sushi"
 *   HF_TOKEN=hf_xxx npx tsx src/scripts/hfThemeGenerator.ts "pirates" creative
 *
 * Output: ./generated/<timestamp>-<prompt>/
 *   ├── checker1.png   (player 1)
 *   ├── checker2.png   (player 2 rival)
 *   └── theme.json     (full theme config)
 *
 * Requirements:
 *   - Free HuggingFace account + token: https://huggingface.co/settings/tokens
 *   - HF Pro (or wait in queue) for FLUX.1-schnell image generation
 */

import 'dotenv/config';
import { HfInference } from '@huggingface/inference';
import { z } from 'zod';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ─── Models ─────────────────────────────────────────────────────────────────

const TEXT_MODEL = 'Qwen/Qwen2.5-72B-Instruct';   // Free, supports JSON mode
const IMAGE_MODEL = 'black-forest-labs/FLUX.1-schnell'; // Fast, high quality

// ─── Schema ─────────────────────────────────────────────────────────────────

const ThemeSchema = z.object({
  player1Theme: z.string(),
  player2Theme: z.string(),
  imagePrompts: z.object({
    checker1: z.string(),
    checker2: z.string(),
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

type ThemeResult = z.infer<typeof ThemeSchema>;

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a backgammon board theme designer for GenNard, an AI-powered backgammon game.

Given a user's theme prompt and style mode, generate a theme with two rival checker sets.

Rules:
1. player1Theme — the theme name directly from the user's prompt (e.g. "Sushi")
2. player2Theme — a creative thematic RIVAL/opposite for player 2
   - Examples: Sushi → Pizza, Cats → Dogs, Fire → Ice, Pirates → Ninjas, Space → Ocean, Angels → Demons
   - Must feel like a natural, fun opponent
3. imagePrompts — detailed prompts for AI image generation:
   - checker1 (classic style): "top-down view of a circular [theme] game piece, [decoration details], on transparent background, game asset style, clean edges, centered composition, 512x512"
   - checker1 (creative style): "top-down view of [theme object] as a game piece, on transparent background, game asset style, clean edges, centered composition, 512x512"
   - checker2: same format for the rival theme
4. colors — 10 CSS hex colors that complement both themes

Return ONLY a valid JSON object with no extra text:
{
  "player1Theme": "string",
  "player2Theme": "string",
  "imagePrompts": {
    "checker1": "string",
    "checker2": "string"
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

/** Strips markdown code fences if the model wraps its JSON output in them. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

// ─── Step 1: Interpret Prompt with HF LLM ───────────────────────────────────

async function interpretPrompt(
  hf: HfInference,
  userPrompt: string,
  styleMode: 'classic' | 'creative',
): Promise<ThemeResult> {
  console.log(`\n[LLM] Model: ${TEXT_MODEL}`);
  console.log(`[LLM] Interpreting: "${userPrompt}" (${styleMode} style)...`);

  const response = await hf.chatCompletion({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Theme prompt: "${userPrompt}"\nStyle mode: ${styleMode}\n\nReturn the JSON theme now.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
    max_tokens: 1024,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from LLM');

  const json = extractJson(raw);
  const parsed = JSON.parse(json);
  return ThemeSchema.parse(parsed);
}

// ─── Step 2: Generate Checker Image with FLUX ────────────────────────────────

async function generateCheckerImage(
  hf: HfInference,
  prompt: string,
  label: string,
): Promise<{ dataUrl: string; buffer: Buffer }> {
  console.log(`[IMG] Generating "${label}" checker...`);
  console.log(`[IMG] Prompt: ${prompt.slice(0, 80)}...`);

  // outputType "dataUrl" returns a base64 data URL string directly
  const dataUrl = await hf.textToImage(
    {
      model: IMAGE_MODEL,
      inputs: prompt,
      parameters: {
        width: 512,
        height: 512,
        num_inference_steps: 4, // FLUX.1-schnell is optimised for 4 steps
      },
    },
    { outputType: 'dataUrl' },
  );

  // Strip the data URL prefix to get raw base64 for writing to disk
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return { dataUrl, buffer: Buffer.from(base64, 'base64') };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const userPrompt = process.argv[2];
  const styleMode = (process.argv[3] as 'classic' | 'creative') ?? 'classic';

  if (!userPrompt) {
    console.error(
      'Usage: HF_TOKEN=hf_xxx npx tsx src/scripts/hfThemeGenerator.ts "<prompt>" [classic|creative]',
    );
    console.error(
      'Example: HF_TOKEN=hf_xxx npx tsx src/scripts/hfThemeGenerator.ts "sushi" creative',
    );
    process.exit(1);
  }

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    console.error('Error: HF_TOKEN environment variable is required.');
    console.error('Get a free token at: https://huggingface.co/settings/tokens');
    process.exit(1);
  }

  if (styleMode !== 'classic' && styleMode !== 'creative') {
    console.error('Style mode must be "classic" or "creative"');
    process.exit(1);
  }

  const hf = new HfInference(HF_TOKEN);

  // ── Step 1: LLM interprets the prompt ──────────────────────────────────
  const theme = await interpretPrompt(hf, userPrompt, styleMode);

  console.log('\n=== Theme Interpreted ===');
  console.log(`  Player 1 : ${theme.player1Theme}`);
  console.log(`  Player 2 : ${theme.player2Theme}`);
  console.log(`  Checker 1 prompt: ${theme.imagePrompts.checker1}`);
  console.log(`  Checker 2 prompt: ${theme.imagePrompts.checker2}`);
  console.log('=========================\n');

  // ── Step 2: Generate both checker images in parallel ───────────────────
  console.log('[IMG] Model:', IMAGE_MODEL);
  console.log('[IMG] Generating both checkers in parallel (may take 10–30s)...\n');

  const [checker1, checker2] = await Promise.all([
    generateCheckerImage(hf, theme.imagePrompts.checker1, theme.player1Theme),
    generateCheckerImage(hf, theme.imagePrompts.checker2, theme.player2Theme),
  ]);

  // ── Save output ────────────────────────────────────────────────────────
  const slug = userPrompt.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const outputDir = join(process.cwd(), 'generated', `${Date.now()}-${slug}`);
  mkdirSync(outputDir, { recursive: true });

  const checker1Path = join(outputDir, 'checker1.png');
  const checker2Path = join(outputDir, 'checker2.png');
  const themePath = join(outputDir, 'theme.json');

  writeFileSync(checker1Path, checker1.buffer);
  writeFileSync(checker2Path, checker2.buffer);
  writeFileSync(
    themePath,
    JSON.stringify(
      {
        ...theme,
        metadata: {
          prompt: userPrompt,
          styleMode,
          model_llm: TEXT_MODEL,
          model_image: IMAGE_MODEL,
          generatedAt: new Date().toISOString(),
        },
      },
      null,
      2,
    ),
  );

  console.log('=== Output Saved ===');
  console.log(`  ${theme.player1Theme} checker : ${checker1Path}`);
  console.log(`  ${theme.player2Theme} checker : ${checker2Path}`);
  console.log(`  Theme JSON          : ${themePath}`);
  console.log('====================\n');
}

main().catch((err) => {
  console.error('\nFatal error:', err.message ?? err);
  process.exit(1);
});
