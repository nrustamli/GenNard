import 'dotenv/config';
import express from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ThemeOrchestrator } from './services/ThemeOrchestrator.js';
import { createThemeRoutes } from './routes/themeRoutes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

const app = express();

// JSON body parser
app.use(express.json());

// Static file serving for cached generated images
app.use('/api/generated', express.static(join(__dirname, '../generated')));

// Theme routes
const orchestrator = new ThemeOrchestrator(apiKey);
app.use('/api', createThemeRoutes(orchestrator));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`GenNard server running on http://localhost:${PORT}`);
});
