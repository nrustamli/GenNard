import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { ThemeGenerationResponse, StyleMode } from '../../../shared/themeTypes.js';

interface IOrchestrator {
  generate(prompt: string, styleMode: StyleMode): Promise<ThemeGenerationResponse>;
}

const ThemeRequestSchema = z.object({
  prompt: z.string().min(1).max(200),
  styleMode: z.enum(['classic', 'creative']),
});

export function createThemeRoutes(orchestrator: IOrchestrator): Router {
  const router = Router();

  router.post('/generate-theme', async (req: Request, res: Response) => {
    const result = ThemeRequestSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const theme = await orchestrator.generate(result.data.prompt, result.data.styleMode);
      res.json(theme);
    } catch (err) {
      console.error('Theme generation failed:', err);
      res.status(500).json({ error: 'Theme generation failed' });
    }
  });

  return router;
}
