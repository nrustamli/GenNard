# GenNard - AI-Generated Backgammon

## Overview

An AI-powered backgammon game inspired by [GenChess](https://labs.google/genchess) where users write a short prompt to generate custom-themed checkers and board. The AI interprets the prompt, generates unique checker designs and a thematic rival set, and renders everything in a 3D-perspective board.

**Example flow**: User types "Sushi" →
- AI generates sushi-themed checkers for Player 1
- AI auto-generates a thematic rival: "Pizza" checkers for Player 2
- Board texture adapts to match (wooden sushi bar surface)
- User plays on their custom-generated board

### Game Modes
1. **Play vs Computer** — AI opponent with Easy/Medium/Hard difficulty
2. **Play Online (2 Players)** — Real-time via shareable link (WebSocket)

### Style Modes (like GenChess)
- **Classic** — AI-generated checkers stay close to traditional round checker shapes
- **Creative** — AI can deviate freely (checkers can be sushi rolls, planets, shields, etc.)

---

## Tech Stack (Mapped from GenChess)

| GenChess Component | GenChess Tech | GenNard Equivalent |
|---|---|---|
| Visuals generation | Imagen 3 (Google) | **Google Imagen 4** or **FLUX (Replicate)** |
| Prompt interpretation & rival generation | Gemini | **Gemini 2.5 Flash** or **Claude Haiku 4.5** |
| Frontend framework | Angular / Next.js | **React + Vite + TypeScript** |
| 3D board rendering | WebGL / Three.js | **React Three Fiber (R3F)** + Three.js |
| Game engine | Stockfish (WASM) | **Custom backgammon engine** (pure TS) |
| Rules engine | chess.js | **Custom** (packages/game-engine) |
| Real-time multiplayer | (single player only) | **WebSocket server** (Node.js + ws) |
| Infrastructure | GCP + TPUs | **Google Cloud Platform (GCP)** — Cloud Run + Cloud Storage |

---

## AI Generation Pipeline

### Step 1: Prompt Interpretation (LLM)

User submits a prompt (e.g., "Sushi"). An LLM processes it with a system prompt:

```
System: You are a backgammon theme designer. Given a user's theme prompt:
1. Generate a name for Player 1's theme based on the prompt
2. Generate a creative thematic RIVAL for Player 2 (e.g., Sushi → Pizza, Cats → Dogs, Fire → Ice)
3. Generate image generation prompts for:
   - Player 1 checker (top-down circular game piece)
   - Player 2 checker (top-down circular game piece)
   - Board texture (seamless top-down surface)
   - Dice texture
4. Generate a color palette (12 CSS colors) that fits the theme
5. Return as structured JSON

User: "Sushi"
```

**Output** (structured JSON via Zod schema):
```json
{
  "player1Theme": "Sushi",
  "player2Theme": "Pizza",
  "imagePrompts": {
    "checker1": "top-down view of a circular sushi roll game piece, maki roll cross-section, rice and nori visible, on transparent background, game asset, clean edges",
    "checker2": "top-down view of a circular pizza game piece, pepperoni pizza slice arranged in circle, melted cheese, on transparent background, game asset, clean edges",
    "board": "seamless wooden sushi bar countertop texture, bamboo accents, top-down view, warm lighting",
    "dice": "wooden sushi chopstick style dice, minimalist Japanese aesthetic"
  },
  "colors": {
    "boardDark": "#5C3A1E",
    "boardLight": "#D4A96A",
    "boardBackground": "#3E2712",
    "checkerPlayer1Accent": "#E84B2B",
    "checkerPlayer2Accent": "#F5A623",
    "barColor": "#2C1810",
    "bearOffColor": "#4A3020",
    "backgroundColor": "#1A0F08",
    "textColor": "#F5E6D3",
    "accentColor": "#8BC34A"
  }
}
```

### Step 2: Image Generation (Parallel)

Using the crafted prompts from Step 1, generate images in parallel:

| Asset | Count | Resolution | Used For |
|---|---|---|---|
| Player 1 checker | 1 image | 512x512 | Checker texture (mapped onto 3D disc) |
| Player 2 checker | 1 image | 512x512 | Checker texture (mapped onto 3D disc) |
| Board surface | 1 image | 1024x1024 | Board texture (tiled/stretched on 3D surface) |
| Dice (optional) | 1 image | 256x256 | Dice face decoration |

**Total: 3-4 images per theme generation**

### Step 3: Apply to 3D Board

Generated images are loaded as Three.js textures and applied to 3D meshes (checker discs, board plane, dice cubes).

### Cost Per Theme Generation

**Chosen approach: Gemini Free Tier for everything**

| Component | Provider | Free Tier | Paid Cost |
|---|---|---|---|
| **LLM (prompt interpretation + colors)** | Gemini 2.5 Flash | 250 req/day FREE | $0.0016/call |
| **Image generation (checkers + board)** | Gemini 2.0 Flash (image output) | ~50 req/day FREE | ~$0.04/image |

For 100 users: **$0** (fits within free tier with caching)
For 1,000+ users: upgrade to paid Gemini or switch to FLUX Schnell for images

---

## AI Theming - All Approaches Considered

### Approach 1: AI Agent + Image Generation (GenChess-style) ← CHOSEN

LLM interprets prompt → crafts image prompts → image API generates assets → applied as 3D textures.

| Metric | Value |
|---|---|
| Cost/theme | $0.013 - $0.22 |
| Speed | 4-30 sec |
| Visual impact | **Highest** |
| Complexity | Medium-High |

### Approach 2: AI Agent → Structured JSON (CSS only)

LLM returns color palette + gradients only. No images generated.

| Metric | Value |
|---|---|
| Cost/theme | $0.0002 - $0.006 |
| Speed | 0.5-5 sec |
| Visual impact | Medium |
| Complexity | Low |

### Approach 3: AI + Predefined Component Library

AI selects from hand-crafted SVG assets. Consistent quality, limited variety.

| Metric | Value |
|---|---|
| Cost/theme | $0.0002 - $0.005 + upfront design |
| Speed | 0.5-3 sec |
| Visual impact | High (consistent) |
| Complexity | Medium (high upfront) |

### Approach 4: Color Palette APIs (Colormind, Huemint)

Specialized palette services. Needs LLM anyway for text interpretation.

| Metric | Value |
|---|---|
| Cost/theme | Free - $0.001 |
| Speed | <1-3 sec |
| Visual impact | Medium |
| Complexity | Medium |

### Approach 5: Client-Side AI (WebLLM)

Run model in browser. Zero cost but 2GB download, poor quality, 35% users excluded.

| Metric | Value |
|---|---|
| Cost/theme | $0.00 |
| Speed | 3-100 sec + 30-120s first download |
| Visual impact | Low-Medium |
| Complexity | High |

### Side-by-Side

| | GenChess-style | CSS Only | Component Lib | Palette API | Client AI |
|---|---|---|---|---|---|
| **Cost/theme** | $0.01-$0.22 | $0.0002-$0.006 | $0.0002-$0.005 | Free-$0.001 | $0.00 |
| **Speed** | 4-30s | 0.5-5s | 0.5-3s | <3s | 3-100s |
| **Visual impact** | **Highest** | Medium | High | Medium | Low |
| **Uniqueness** | Every theme unique | Color combos | Limited to library | Generic | Poor |
| **GenChess parity** | **Yes** | No | No | No | No |

---

## Project Structure

```
GenNard/
├── package.json                          # Root workspace config
├── tsconfig.base.json
├── Plan.md
│
├── packages/
│   ├── game-engine/                      # Pure TS backgammon logic (zero deps)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── index.ts                  # Public API barrel export
│   │   │   ├── types.ts                  # All game type definitions
│   │   │   ├── constants.ts              # Initial board setup, dice combos
│   │   │   ├── Board.ts                  # Board state manipulation
│   │   │   ├── Dice.ts                   # Dice rolling, doubles logic
│   │   │   ├── MoveGenerator.ts          # Generate all legal moves (recursive)
│   │   │   ├── MoveValidator.ts          # Validate a specific move
│   │   │   ├── BearingOff.ts             # Bearing off specific logic
│   │   │   ├── GameState.ts              # Full game state machine
│   │   │   ├── GameReducer.ts            # Pure reducer: (state, action) => state
│   │   │   └── ai/
│   │   │       ├── Evaluator.ts          # Board position evaluation
│   │   │       └── AiPlayer.ts           # AI move selection
│   │   └── tests/
│   │       ├── Board.test.ts
│   │       ├── MoveGenerator.test.ts
│   │       ├── MoveValidator.test.ts
│   │       ├── GameState.test.ts
│   │       ├── BearingOff.test.ts
│   │       └── AiPlayer.test.ts
│   │
│   ├── server/                           # Node.js backend (WS + API)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                  # HTTP + WS server entry point
│   │   │   ├── WebSocketServer.ts        # WS connection handling
│   │   │   ├── GameRoom.ts              # Single game room: 2 players + state
│   │   │   ├── RoomManager.ts           # Create/find/destroy rooms
│   │   │   ├── MessageHandler.ts        # Parse and dispatch WS messages
│   │   │   ├── routes/
│   │   │   │   └── themeRoutes.ts       # POST /api/generate-theme endpoint
│   │   │   ├── services/
│   │   │   │   ├── ThemeOrchestrator.ts # Orchestrates LLM + image generation
│   │   │   │   ├── LlmService.ts       # Gemini/Claude/GPT API calls
│   │   │   │   └── ImageService.ts     # FLUX/Imagen API calls
│   │   │   └── utils/
│   │   │       ├── idGenerator.ts       # Short URL-safe room IDs
│   │   │       └── imageCache.ts        # Cache generated images
│   │   └── tests/
│   │       ├── GameRoom.test.ts
│   │       ├── RoomManager.test.ts
│   │       └── ThemeOrchestrator.test.ts
│   │
│   └── client/                           # React + Vite + Three.js frontend
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── public/
│       │   ├── favicon.svg
│       │   ├── models/                   # Default 3D models (GLTF)
│       │   │   ├── checker.glb          # Base checker disc mesh
│       │   │   └── dice.glb             # Dice cube mesh
│       │   └── textures/                 # Default/fallback textures
│       │       ├── wood-board.jpg
│       │       ├── checker-white.png
│       │       └── checker-black.png
│       └── src/
│           ├── main.tsx
│           ├── App.tsx                   # Router setup
│           │
│           ├── pages/
│           │   ├── LandingPage.tsx       # Game creation: prompt input + mode select
│           │   ├── GeneratingPage.tsx    # Loading screen while AI generates assets
│           │   ├── GamePage.tsx          # Main 3D game view
│           │   └── JoinPage.tsx          # Join via shareable link
│           │
│           ├── components/
│           │   ├── three/                # React Three Fiber 3D components
│           │   │   ├── BoardScene.tsx    # Main R3F Canvas + scene setup
│           │   │   ├── Board3D.tsx       # 3D board surface with texture
│           │   │   ├── Point3D.tsx       # Triangle point on the board
│           │   │   ├── Checker3D.tsx     # 3D disc with generated texture
│           │   │   ├── Bar3D.tsx         # Center bar
│           │   │   ├── BearOffTray3D.tsx # Bear-off area
│           │   │   ├── Dice3D.tsx        # 3D animated dice
│           │   │   ├── CameraController.tsx # Orbit/fixed camera
│           │   │   ├── Lighting.tsx      # Scene lighting setup
│           │   │   └── MoveHighlight.tsx # Glow/highlight on valid targets
│           │   ├── ui/
│           │   │   ├── Button.tsx
│           │   │   ├── Modal.tsx
│           │   │   ├── PromptInput.tsx   # Theme prompt with "Classic/Creative" toggle
│           │   │   ├── GameModeSelector.tsx
│           │   │   ├── StyleModeToggle.tsx # Classic vs Creative
│           │   │   ├── ShareLink.tsx
│           │   │   ├── PlayerInfo.tsx    # Player name, theme name, pip count
│           │   │   ├── GeneratingOverlay.tsx # "Generating your Sushi vs Pizza board..."
│           │   │   └── ThemePreview.tsx  # Preview generated checker images
│           │   └── layout/
│           │       ├── Header.tsx
│           │       └── GameLayout.tsx
│           │
│           ├── hooks/
│           │   ├── useGame.ts
│           │   ├── useWebSocket.ts
│           │   ├── useOnlineGame.ts
│           │   ├── useAiGame.ts
│           │   ├── useDiceAnimation.ts
│           │   ├── useThemeGeneration.ts # Calls /api/generate-theme, manages loading
│           │   └── useTextureLoader.ts   # Loads generated images as Three.js textures
│           │
│           ├── store/
│           │   ├── gameStore.ts          # Zustand: game state
│           │   └── themeStore.ts         # Zustand: theme/asset state
│           │
│           ├── theme/
│           │   ├── types.ts             # ThemeDefinition with image URLs + colors
│           │   ├── defaults.ts          # Fallback theme (classic wood board)
│           │   └── themeAdapter.ts      # Adapter interface
│           │
│           ├── services/
│           │   ├── websocketService.ts
│           │   └── themeApi.ts          # POST /api/generate-theme client
│           │
│           ├── utils/
│           │   ├── boardCoordinates.ts  # Point indices → 3D positions
│           │   └── animations.ts
│           │
│           └── styles/
│               ├── global.css
│               └── ui.css               # UI component styles (not board - board is 3D)
│
└── shared/
    ├── protocol.ts                       # WS message types
    └── themeTypes.ts                     # Theme types shared between client/server
```

---

## Data Models

### Core Game Types (`packages/game-engine/src/types.ts`)

```typescript
export type Player = 'white' | 'black';

// Board: 24-element array. Positive = white checkers, Negative = black.
export type BoardPoints = [
  number, number, number, number, number, number,   // points 1-6  (white home)
  number, number, number, number, number, number,   // points 7-12
  number, number, number, number, number, number,   // points 13-18
  number, number, number, number, number, number    // points 19-24 (black home)
];

export interface BarState { white: number; black: number; }
export interface BorneOffState { white: number; black: number; }

export interface DiceRoll { die1: number; die2: number; }

export interface DiceState {
  roll: DiceRoll | null;
  movesRemaining: number[];  // [3, 5] or [4, 4, 4, 4] for doubles
}

export type GamePhase =
  | 'waiting_for_players'
  | 'rolling_for_first'
  | 'rolling'
  | 'moving'
  | 'game_over';

export interface DoublingCubeState {
  value: number;
  owner: Player | null;
  lastDoubler: Player | null;
}

export interface GameState {
  id: string;
  points: BoardPoints;
  bar: BarState;
  borneOff: BorneOffState;
  currentPlayer: Player;
  dice: DiceState;
  phase: GamePhase;
  doublingCube: DoublingCubeState;
  turnNumber: number;
  winner: Player | null;
  winType: 'normal' | 'gammon' | 'backgammon' | null;
  moveHistory: RecordedMove[];
}

export interface Move {
  from: number | 'bar';
  to: number | 'off';
  dieUsed: number;
}

export interface RecordedMove {
  player: Player;
  dice: DiceRoll;
  moves: Move[];
  turnNumber: number;
}

export type GameAction =
  | { type: 'ROLL_DICE'; player: Player }
  | { type: 'MOVE_CHECKER'; player: Player; move: Move }
  | { type: 'UNDO_MOVE'; player: Player }
  | { type: 'CONFIRM_TURN'; player: Player }
  | { type: 'OFFER_DOUBLE'; player: Player }
  | { type: 'ACCEPT_DOUBLE'; player: Player }
  | { type: 'REJECT_DOUBLE'; player: Player }
  | { type: 'FORFEIT'; player: Player };
```

### Theme Types (`shared/themeTypes.ts`)

```typescript
export type StyleMode = 'classic' | 'creative';

export interface ThemeGenerationRequest {
  prompt: string;
  styleMode: StyleMode;   // Classic: stay close to round checkers. Creative: anything goes.
}

export interface ThemeGenerationResponse {
  player1: {
    themeName: string;         // "Sushi"
    checkerImageUrl: string;   // URL to generated 512x512 checker image
  };
  player2: {
    themeName: string;         // "Pizza" (AI-generated rival)
    checkerImageUrl: string;   // URL to generated 512x512 checker image
  };
  board: {
    textureUrl: string;        // URL to generated 1024x1024 board texture
  };
  dice?: {
    textureUrl: string;        // Optional custom dice texture
  };
  colors: {
    boardDark: string;
    boardLight: string;
    boardFrame: string;
    barColor: string;
    bearOffColor: string;
    backgroundColor: string;   // Page background
    textColor: string;
    accentColor: string;
    player1Accent: string;     // UI color for player 1
    player2Accent: string;     // UI color for player 2
  };
  metadata: {
    prompt: string;
    styleMode: StyleMode;
    generatedAt: string;
  };
}
```

---

## AI Generation Pipeline (Server-Side)

### ThemeOrchestrator Flow

```
POST /api/generate-theme
  Body: { prompt: "Sushi", styleMode: "creative" }

  ┌──────────────────────────────────────────────────────┐
  │ Step 1: LLM Interpretation (2-4 sec)                 │
  │                                                      │
  │  Input: "Sushi" + styleMode                          │
  │  Output: {                                           │
  │    player1Theme: "Sushi",                            │
  │    player2Theme: "Pizza",                            │
  │    imagePrompts: {                                   │
  │      checker1: "top-down sushi roll game piece...",  │
  │      checker2: "top-down pizza game piece...",       │
  │      board: "wooden sushi bar texture...",           │
  │    },                                                │
  │    colors: { ... }                                   │
  │  }                                                   │
  └──────────────┬───────────────────────────────────────┘
                 │
  ┌──────────────▼───────────────────────────────────────┐
  │ Step 2: Image Generation (PARALLEL, 2-10 sec)        │
  │                                                      │
  │  ┌─────────────────┐  ┌─────────────────┐           │
  │  │ Generate         │  │ Generate         │          │
  │  │ Checker 1 (512²) │  │ Checker 2 (512²) │          │
  │  └────────┬────────┘  └────────┬────────┘           │
  │           │                    │                     │
  │  ┌────────▼────────┐                                │
  │  │ Generate         │                                │
  │  │ Board (1024²)    │  (all 3 in parallel)           │
  │  └────────┬────────┘                                │
  └──────────────┬───────────────────────────────────────┘
                 │
  ┌──────────────▼───────────────────────────────────────┐
  │ Step 3: Upload & Cache                               │
  │                                                      │
  │  Store images (local disk / S3 / Cloudflare R2)     │
  │  Return public URLs                                  │
  │  Cache by prompt hash (same prompt = instant return) │
  └──────────────┬───────────────────────────────────────┘
                 │
  ┌──────────────▼───────────────────────────────────────┐
  │ Response: ThemeGenerationResponse                     │
  │                                                      │
  │  { player1: { checkerImageUrl: "..." }, ... }        │
  └──────────────────────────────────────────────────────┘

Total time: 4-12 sec (LLM + parallel images)
```

### LLM System Prompt (for Step 1)

```
You are a backgammon board theme designer for GenNard.

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

Return valid JSON matching the provided schema.
```

---

## 3D Board Rendering (React Three Fiber)

### Why 3D (like GenChess)

GenChess renders AI-generated 2D images onto 3D chess pieces in a WebGL scene. GenNard does the same:
- Board is a 3D plane with the generated texture mapped onto it
- Checkers are 3D disc meshes (cylinders) with generated images as top textures
- Dice are 3D cubes with physics-based roll animation
- Camera provides a perspective/isometric view of the board
- Lighting makes the generated textures look polished and integrated

### Key 3D Components

**BoardScene.tsx** — R3F Canvas wrapper:
```
<Canvas camera={{ position: [0, 8, 6], fov: 50 }}>
  <Lighting />
  <Board3D texture={boardTexture} colors={colors} />
  {points.map(p => <Point3D key={p.index} ... />)}
  {checkers.map(c => <Checker3D key={c.id} texture={checkerTexture} ... />)}
  <Bar3D />
  <Dice3D roll={diceRoll} />
  <CameraController />
</Canvas>
```

**Checker3D.tsx** — Disc mesh with generated texture:
```
<mesh position={[x, y, z]}>
  <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
  <meshStandardMaterial map={generatedTexture} />
</mesh>
```

**Dice3D.tsx** — Physics-based dice with cannon.js or rapier:
```
Roll animation: apply random torque/force → settle → read face → report result
```

### 3D Coordinate System

```
Board dimensions: 14 x 10 units (Three.js world space)

Y-axis = up (height)
X-axis = left-right (points 1-24)
Z-axis = near-far (top/bottom row)

Point positions:
  Bottom row (z=+4): points 1-12 (right to left, x = 6 to -6, gap at x=0 for bar)
  Top row (z=-4):    points 13-24 (left to right, x = -6 to 6, gap at x=0 for bar)

Checker stacking: each checker is 0.1 units tall, stacked on Y-axis
  - First checker: y = 0.05
  - Second: y = 0.15
  - etc.
```

---

## WebSocket Message Protocol (`shared/protocol.ts`)

### Client → Server

```typescript
export type ClientMessage =
  | { type: 'CREATE_ROOM'; payload: { playerName: string; themePrompt: string; styleMode: StyleMode } }
  | { type: 'JOIN_ROOM'; payload: { roomId: string; playerName: string } }
  | { type: 'ROLL_DICE' }
  | { type: 'MOVE_CHECKER'; payload: { move: Move } }
  | { type: 'UNDO_MOVE' }
  | { type: 'CONFIRM_TURN' }
  | { type: 'OFFER_DOUBLE' }
  | { type: 'ACCEPT_DOUBLE' }
  | { type: 'REJECT_DOUBLE' }
  | { type: 'FORFEIT' }
  | { type: 'CHAT_MESSAGE'; payload: { text: string } }
  | { type: 'PING' };
```

### Server → Client

```typescript
export type ServerMessage =
  | { type: 'ROOM_CREATED'; payload: { roomId: string; playerId: string; shareUrl: string; theme: ThemeGenerationResponse } }
  | { type: 'ROOM_JOINED'; payload: { roomId: string; playerId: string; opponentName: string; theme: ThemeGenerationResponse } }
  | { type: 'OPPONENT_JOINED'; payload: { opponentName: string } }
  | { type: 'GAME_STATE'; payload: { state: GameState; validMoves: Move[] } }
  | { type: 'DICE_ROLLED'; payload: { player: Player; roll: DiceRoll; validMoves: Move[] } }
  | { type: 'MOVE_MADE'; payload: { player: Player; move: Move; remainingMoves: Move[] } }
  | { type: 'TURN_ENDED'; payload: { nextPlayer: Player } }
  | { type: 'DOUBLE_OFFERED'; payload: { player: Player; cubeValue: number } }
  | { type: 'DOUBLE_RESPONSE'; payload: { accepted: boolean; cubeValue: number } }
  | { type: 'GAME_OVER'; payload: { winner: Player; winType: string; finalState: GameState } }
  | { type: 'OPPONENT_DISCONNECTED' }
  | { type: 'OPPONENT_RECONNECTED' }
  | { type: 'ERROR'; payload: { code: string; message: string } }
  | { type: 'PONG' };
```

---

## MoveGenerator Algorithm

The most complex module. Recursive generation of all legal turn sequences.

```
generateAllLegalTurnSequences(state):
  diceRemaining = state.dice.movesRemaining

  // Bar checkers MUST enter first
  if hasCheckersOnBar(state, currentPlayer):
    return generateMovesFromBar(state, diceRemaining)

  results = []
  generateRecursive(state, diceRemaining, [], results)

  // Rule: must use BOTH dice if possible.
  // If only one die can be used, must use the LARGER one.
  maxMovesUsed = max(results.map(r => r.length))
  results = results.filter(r => r.length === maxMovesUsed)

  return deduplicateByFinalState(results)
```

**Key edge cases**:
- **Doubles**: 4 identical dice values, 4 moves
- **Bar entry**: must enter ALL bar checkers before moving any board checker
- **Bear off exact vs. higher**: if no checker on exact point, bear off from highest occupied (only if die > all occupied)
- **Forced larger die**: if only one of two dice can be played, must play the larger
- **No legal moves**: turn passes entirely

---

## AI Opponent

```typescript
evaluatePosition(state, player, weights):
  score = 0
  score += weights.pipCount * (opponentPips - myPips)
  score -= weights.blotExposure * blotDanger
  score += weights.primeLength * longestPrime
  score += weights.blockadeStrength * blockedPointCount
  score += weights.anchorStrength * anchorCount
  score += weights.homeBoardStrength * homePointsHeld
  score -= weights.barPenalty * checkersOnBar
  score += weights.bearOffProgress * checkersBorneOff
  return score
```

AI generates all legal turn sequences → evaluates each → picks best. Easy adds noise, Hard is pure evaluation.

---

## NPM Packages

### Root / Shared
| Package | Purpose |
|---|---|
| `typescript` ~5.7 | Language |
| `vitest` | Testing |
| `zod` | Runtime type validation |

### `packages/game-engine`
| Package | Purpose |
|---|---|
| *(none)* | Pure TypeScript, zero deps |

### `packages/server`
| Package | Purpose |
|---|---|
| `ws` | WebSocket server |
| `express` | HTTP server (theme API routes) |
| `nanoid` | Room IDs |
| `zod` | Message validation |
| `dotenv` | Env config |
| `tsx` | Dev runner |
| `@google/generative-ai` | Gemini API (LLM + image generation) |

### `packages/client`
| Package | Purpose |
|---|---|
| `react` + `react-dom` ~19 | UI |
| `vite` ~6 | Build/dev |
| `@react-three/fiber` | React Three Fiber (R3F) — React renderer for Three.js |
| `@react-three/drei` | R3F helpers (OrbitControls, useTexture, Environment, etc.) |
| `three` | Three.js core |
| `@react-three/rapier` | Physics engine (dice rolling) |
| `react-router-dom` ~7 | Routing |
| `zustand` | State management |
| `framer-motion` | UI animations (not 3D — for page transitions, modals) |
| `clsx` | CSS class composition |

---

## Implementation Phases

### Phase 1: Game Engine Foundation

Set up monorepo. Build all game logic:
1. `types.ts` — all type definitions
2. `constants.ts` — initial board positions
3. `Board.ts` — createInitialBoard(), cloneState(), applyMove()
4. `Dice.ts` — rollDice(), getMovesFromRoll()
5. `MoveValidator.ts` — isLegalMove()
6. `MoveGenerator.ts` — generateAllLegalMoves() (recursive)
7. `BearingOff.ts` — canBearOff(), getBearOffMoves()
8. `GameState.ts` — createNewGame(), checkWinner()
9. `GameReducer.ts` — gameReducer(state, action)
10. Write comprehensive tests for each module

### Phase 2: 3D Board Rendering

Scaffold React + Vite + R3F:
1. `BoardScene.tsx` — R3F Canvas with camera, lighting
2. `Board3D.tsx` — 3D plane with wood texture (default)
3. `Point3D.tsx` — Triangle geometry on the board
4. `Checker3D.tsx` — Cylinder meshes with textures, stacking logic
5. `Bar3D.tsx` — Center bar area
6. `BearOffTray3D.tsx` — Side tray
7. `Dice3D.tsx` — 3D dice with roll animation (Rapier physics)
8. `CameraController.tsx` — Fixed perspective camera
9. Wire up: render hardcoded GameState, verify 3D visuals
10. Click/raycast handling for checker selection

### Phase 3: Local Playable Game

1. `gameStore.ts` (Zustand) wrapping GameReducer
2. `useGame.ts` hook
3. Raycast-based click handling: click checker → valid targets glow → click target
4. Dice physics animation (roll → settle → read face)
5. Checker movement animation (lerp from old → new position)
6. Turn flow: Roll → Move → Confirm → Next player
7. Game over detection

### Phase 4: AI Theme Generation Pipeline

1. `ThemeOrchestrator.ts` (server) — orchestrates LLM + image gen
2. `LlmService.ts` — calls Gemini/Claude with system prompt, returns structured JSON
3. `ImageService.ts` — calls FLUX/Imagen with crafted prompts, returns URLs
4. `POST /api/generate-theme` endpoint
5. Image caching by prompt hash
6. `themeApi.ts` (client) — calls the endpoint
7. `useThemeGeneration.ts` — manages loading/progress state
8. `GeneratingPage.tsx` — animated loading screen ("Generating Sushi vs Pizza...")
9. `useTextureLoader.ts` — loads image URLs as Three.js textures
10. Apply generated textures to Checker3D and Board3D
11. Apply generated colors to UI and point triangles
12. **Classic vs Creative** mode toggle on landing page
13. Fallback to default wood theme if generation fails

### Phase 5: AI Opponent

1. `Evaluator.ts` — weighted position scoring
2. `AiPlayer.ts` — evaluate all legal turns, pick best
3. `useAiGame.ts` — run AI with "thinking" delay
4. Difficulty selector (Easy/Medium/Hard)

### Phase 6: WebSocket Server + Online Multiplayer

1. Server scaffold: Express HTTP + WS
2. `RoomManager.ts` — rooms with nanoid, 30min cleanup
3. `GameRoom.ts` — authoritative state, validates all moves
4. `MessageHandler.ts` — parse + validate (zod)
5. `websocketService.ts` (client) — connect + reconnect
6. `useOnlineGame.ts` — sync from server
7. `JoinPage.tsx` — join via URL (receives same theme)
8. `ShareLink.tsx` — copy shareable link
9. Theme is generated when room is created, sent to both players on join

### Phase 7: Polish

1. Doubling cube (state machine + 3D cube model)
2. Undo moves within a turn
3. Move history panel
4. Sound effects (dice, checker click, hit, bear off)
5. Mobile responsive (touch-friendly 3D interaction)
6. "Regenerate theme" button
7. Gallery of generated themes / recent games
8. Error handling + graceful degradation

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **GenChess-style pipeline** | LLM interprets prompt + generates rivals, image API generates assets. Highest visual impact, matches reference product. |
| **React Three Fiber for 3D** | React integration, declarative 3D scene. Generated textures map naturally onto 3D meshes. |
| **Server-side theme generation** | API keys stay secure. Caching is centralized. Both online players get the same theme. |
| **Gemini free tier for all AI** | Single provider for LLM + images. $0 cost for 100 users. Simplest integration. |
| **Separate game-engine package** | Runs on both client (AI) and server (online). Zero deps. |
| **Server-authoritative online** | Prevents cheating. Server rolls dice. Both clients see same state. |
| **Signed integers for board** | Positive = white, negative = black. Compact, fast. Standard in backgammon engines. |
| **Prompt caching for LLM** | Same system prompt on every call → 90% discount on input tokens (Claude) or similar (Gemini). |
| **Image caching by prompt hash** | Same prompt = instant return. No redundant generation. |

---

## Cost Summary

### Current Approach: Gemini Free Tier

| Component | Free Tier Limit | 100 Users Need |
|---|---|---|
| LLM (Gemini 2.5 Flash) | 250 req/day | ~100 calls |
| Images (Gemini 2.0 Flash) | ~50 img/day | ~300 images (~6 days, or less with caching) |
| **Total cost** | | **$0** |

### Deployment: Google Cloud Platform (GCP)

| Service | Purpose | Free Tier |
|---|---|---|
| Cloud Run | Backend (WS server + API) | 2M requests/month free |
| Cloud Storage | Generated image cache | 5GB free |
| Firebase Hosting (or Cloud Run) | Frontend static files | 10GB/month free |
| **Total hosting** | | **$0** (within free tier) |

### Scaling Beyond Free Tier

| Users/month | Themes generated | Monthly cost |
|---|---|---|
| 100 | ~50 (cached) | **$0 (free tier)** |
| 1,000 | ~500 | ~$30 (paid Gemini) |
| 10,000 | ~5,000 | ~$250 |

---

## Verification Checklist

1. **Game engine**: `vitest` — all rules tested (moves, bar, bearing off, doubles, forced moves)
2. **3D board**: Visual — load initial position, verify 15 checkers per side, textures render
3. **Local play**: Full game to completion with click-to-move and dice animation
4. **Theme generation**: Type "Sushi" → see generated sushi checkers + pizza rival + themed board
5. **Classic vs Creative**: Classic keeps round discs, Creative generates thematic shapes
6. **AI opponent**: Play vs computer at all difficulties, verify legal moves
7. **Online**: Two tabs — create game, join via link, both see same generated theme, play full game
8. **Caching**: Same prompt twice → second is instant (no re-generation)
9. **Fallback**: If image API fails, board renders with default wood textures
