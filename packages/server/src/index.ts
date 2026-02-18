import 'dotenv/config';
import express from 'express';
import { ThemeOrchestrator } from './services/ThemeOrchestrator.js';
import { HuggingFaceOrchestrator } from './services/HuggingFaceOrchestrator.js';
import { createThemeRoutes } from './routes/themeRoutes.js';

const PORT = Number(process.env.PORT) || 4000;
const provider = process.env.THEME_PROVIDER ?? 'gemini'; // 'gemini' | 'huggingface'

const app = express();
app.use(express.json());

// Pick orchestrator based on THEME_PROVIDER env var
let orchestrator: ThemeOrchestrator | HuggingFaceOrchestrator;

if (provider === 'huggingface') {
  const token = process.env.HF_TOKEN;
  if (!token) {
    console.error('HF_TOKEN is required when THEME_PROVIDER=huggingface');
    process.exit(1);
  }
  console.log('Theme provider: HuggingFace (open-source models)');
  orchestrator = new HuggingFaceOrchestrator(token);
} else {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is required when THEME_PROVIDER=gemini (default)');
    process.exit(1);
  }
  console.log('Theme provider: Google Gemini');
  orchestrator = new ThemeOrchestrator(apiKey);
}

app.use('/api', createThemeRoutes(orchestrator));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`GenNard server running on http://localhost:${PORT}`);
});
