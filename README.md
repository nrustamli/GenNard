# GenNard

**AI-powered backgammon with custom-generated themes.**

Type words like "Moon vs Sun", or "Barbie vs Oppenheimer" and GenNard uses AI to generate unique checker textures, a board design, and a color palette — then lets you play a full game of backgammon on a 3D board with your custom theme.



## Why GenNard?

- **Every game looks different** — AI generates unique visuals from any theme you describe
- **Real backgammon** — complete game engine with legal move validation, bearing off, and win detection
- **3D board** — interactive Three.js board with physics, not a flat 2D grid
- **Instant caching** — generated themes are cached so repeat prompts load instantly

## Quick Start

```bash
git clone https://github.com/nuranarustamli/GenNard.git
cd GenNard
npm install
```

Create `packages/server/.env`:

```env
HF_TOKEN=hf_your_token_here
THEME_PROVIDER=huggingface
```

> Get a free HuggingFace token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

Start both client and server:

```bash
npm run dev:client   # http://localhost:3000
npm run dev:server   # http://localhost:4000
```

Open [http://localhost:3000](http://localhost:3000), enter a theme, and play.

## How It Works

```
User enters theme prompt (e.g. "Slytherin vs Gryffindor")
        │
        ▼
   Express server
        │
        ├── Qwen 2.5-72B → interprets theme, generates image prompts + color palette
        │
        └── FLUX.1-schnell → generates 3 textures in parallel
                │   (player 1 checker, player 2 checker, board)
                ▼
        Cached to disk (SHA-256 key)
                │
                ▼
   React client renders 3D board with generated textures
```

Two style modes are available: **Classic** (traditional look) and **Creative** (artistic interpretation).

## Tech Stack

- Frontend: React 19, TypeScript
- 3D : Three.js, React Three Fiber, React Three Rapier 
- State : Zustand 
- Backend : Node.js, Express 
- AI (text) : Qwen 2.5-72B-Instruct (HuggingFace) 
- AI (images) : FLUX.1-schnell (HuggingFace) 
- Game Logic : Pure TypeScript (zero deps) 
- Deploy : Firebase Hosting + Google Cloud Run 

## Project Structure

```
GenNard/
├── packages/
│   ├── client/          React + Three.js frontend
│   ├── server/          Express API + AI orchestration
│   ├── game-engine/     Pure backgammon logic (tested, zero deps)
│   └── shared/          Shared TypeScript types
├── docs/
│   └── ARCHITECTURE.md  Detailed architecture guide
├── Dockerfile           Multi-stage Cloud Run image
└── firebase.json        Hosting + API rewrite config
```

## Game Engine

The game engine is a standalone package with zero runtime dependencies. All logic is implemented as pure functions:

```typescript
import { createNewGame, gameReducer } from '@gennard/game-engine';

const game = createNewGame();
const next = gameReducer(game, { type: 'ROLL_DICE' });
```

Key modules: `MoveGenerator` (legal turn enumeration), `MoveValidator`, `BearingOff`, `GameReducer` (state machine). Run tests with:

```bash
npm test
```
## Deployment

**Client** deploys to Firebase Hosting via GitHub Actions on push to `master`.

**Server** deploys to Google Cloud Run via Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full deployment topology and CI/CD pipeline details.

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and run `npm test`
4. Submit a pull request

## License

This project is private. All rights reserved.
