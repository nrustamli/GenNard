# GenNard Architecture

GenNard is an AI-powered backgammon game where players enter a theme prompt (e.g. "Sushi vs Pizza") and the app generates unique checker textures, board designs, and a color palette using AI. The game is then played on a 3D interactive board in the browser.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **3D Rendering:** Three.js via React Three Fiber + React Three Rapier (physics)
- **State Management:** Zustand (theme state), React useState (game state)
- **Animations:** Framer Motion
- **Backend:** Node.js, Express
- **AI Text Generation:** Qwen/Qwen2.5-72B-Instruct (via HuggingFace)
- **AI Image Generation:** FLUX.1-schnell (via HuggingFace)
- **Hosting:** Firebase Hosting (client) + Google Cloud Run (server)
- **Monorepo:** npm workspaces

## Project Structure

```
packages/
├── client/          → React frontend (UI + 3D board)
├── server/          → Express API (AI theme generation)
├── game-engine/     → Pure TypeScript backgammon logic (zero deps)
└── shared/          → Shared TypeScript types
```

The four packages are independent npm workspaces. The game engine has zero runtime dependencies, making it easy to test and reuse.

## How It Works End-to-End

### 1. User enters a theme

On the landing page (`LandingPage.tsx`), the user types a theme prompt and picks a style mode (classic or creative). Clicking "Generate" triggers an HTTP POST to `/api/generate-theme`.

### 2. Server generates the theme with AI

The server receives the request in `themeRoutes.ts`, validates it with Zod, and hands it to `HuggingFaceOrchestrator.ts`. The orchestrator:

1. **Checks the cache** — a SHA-256 hash of (prompt + styleMode) is used as the cache key. If a cached result exists on disk in `packages/server/generated/`, it returns immediately.
2. **Calls the LLM** — sends the prompt to Qwen 2.5-72B, which returns a JSON object containing player names, image generation prompts, and a 10-color palette.
3. **Generates 3 images in parallel** — calls FLUX.1-schnell to create a checker texture for each player and a board texture (all 512x512, 4 inference steps). Images come back as base64 data URLs.
4. **Caches the result** to disk for future requests.

### 3. Client receives and stores the theme

The response is stored in a Zustand store (`themeStore.ts`) which holds the generated colors, player names, and image URLs. The app navigates to the game page.

### 4. 3D board renders

`GamePage.tsx` creates a new game state using the game engine and renders a Three.js scene via `BoardScene.tsx`. Key 3D components:

- **Board3D** — the board surface and wooden frame
- **Point3D** — the 24 triangular points on the board
- **Checker3D** — cylindrical meshes with AI-generated textures applied via `useTextureLoader`

The generated theme colors are applied to the board, points, and UI elements. Checker textures are loaded as Three.js materials.

### 5. Game loop

The game runs entirely on the client using the game engine package. The flow per turn:

```
Player rolls dice
  → gameReducer(state, { type: 'ROLL_DICE' })
  → Player clicks a checker, then clicks a destination point
  → gameReducer(state, { type: 'MOVE_CHECKER', move })
  → Board state updates, move is removed from remaining dice
  → When no moves remain, turn passes to the other player
  → When all 15 checkers are borne off, game ends
```

`gameReducer` is a pure function — it takes the current state and an action, and returns a new state. No mutations, no side effects.

## Game Engine Deep Dive

The game engine (`packages/game-engine/`) implements Nardi-style backgammon rules:

### Board Representation

- 24-element array where positive values = white checkers, negative = black
- Separate tracking for the bar (hit checkers) and borne-off counts
- White moves from point 24 toward point 1; Black moves from point 1 toward point 24

### Key Modules

| Module | What it does |
|--------|-------------|
| `Board.ts` | Applies moves to the board (add/remove checkers, handle hits) |
| `Dice.ts` | Generates rolls and enumerates available moves from dice values |
| `MoveValidator.ts` | Checks if a single move is legal (destination not blocked, etc.) |
| `MoveGenerator.ts` | Recursively finds all valid move sequences for a turn |
| `BearingOff.ts` | Handles bear-off rules (exact die or higher when no checkers behind) |
| `GameState.ts` | Creates new games and detects wins (normal, gammon, backgammon) |
| `GameReducer.ts` | Pure state machine: `(state, action) → newState` |

### Rules Enforced

- Must use both dice if possible; if only one can be used, must use the higher one
- Checkers on the bar must re-enter before any other move
- Bearing off only allowed when all 15 checkers are in the home board
- Landing on a single opponent checker sends it to the bar
- Win detection includes gammon and backgammon variants

## API

| `/api/generate-theme` | POST | Generate AI theme (prompt + styleMode) |
| `/api/health` | GET | Health check |

**Request:**
```json
{ "prompt": "Sushi vs Pizza", "styleMode": "creative" }
```

**Response** includes player names, checker image URLs (base64), board texture URL, a 10-color palette, and metadata.

## Deployment

- **Client** is built by Vite into `packages/client/dist` and served by Firebase Hosting. All non-API routes fall through to `index.html` (SPA).
- **Server** is containerized via a multi-stage Dockerfile and deployed to Google Cloud Run. Cloud Build (`cloudbuild.yaml`) handles the CI/CD pipeline.
- **Routing:** Firebase rewrites `/api/**` requests to the Cloud Run service, so the client and server share the same domain.
- **Secrets:** The HuggingFace API token (`HF_TOKEN`) is injected from Google Secret Manager at runtime.

## Styling

- Inline React styles with design-token constants (colors, fonts, shadows)
- Three.js materials for 3D elements (standard mesh materials with texture maps)
- Responsive layout via a `useIsMobile()` hook that adjusts flex direction, font sizes, and padding

## Notable Design Decisions

- **Game engine is a separate package with zero dependencies** — keeps game logic testable and decoupled from rendering. Tested with Vitest.
- **Cache-first AI generation** — avoids redundant API calls. Same prompt always returns the same result instantly.
- **Parallel image generation** — all 3 images are generated concurrently to minimize wait time.
- **No database** — themes are cached on disk, game state lives in the client. Simple and stateless.
- **WebSocket dependency exists but is unused** — prepared for future multiplayer support.
