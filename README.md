# GenNard

**AI-powered backgammon with custom-generated themes.**

Type words like "Moon vs Sun", or "Barbie vs Oppenheimer" and GenNard uses AI to generate unique checker textures, a board design, and a color palette — then lets you play a full game of backgammon on a 3D board with your custom theme.

<p align="center">
   <img width="600" height="400" alt="moon_vs_star_theme_example" src="https://github.com/user-attachments/assets/78e887b5-81b5-4a46-aac6-72bb103cfa74"/>
</p>

 
## Why GenNard?

- **Every game looks different** — AI generates unique visuals from any theme you describe
- **Real backgammon** — complete game engine with legal move validation, bearing off, and win detection
- **3D board** — interactive Three.js board with physics, not a flat 2D grid
- **Instant caching** — generated themes are cached so repeat prompts load instantly

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
