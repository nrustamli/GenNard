import 'dotenv/config';
import express from 'express';
import { HuggingFaceOrchestrator } from './services/HuggingFaceOrchestrator.js';
import { createThemeRoutes } from './routes/themeRoutes.js';

const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.use(express.json());

const token = process.env.HF_TOKEN;
if (!token) {
  console.error('HF_TOKEN is required');
  process.exit(1);
}

const orchestrator = new HuggingFaceOrchestrator(token);

app.use('/api', createThemeRoutes(orchestrator));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`GenNard server running on http://localhost:${PORT}`);
});
