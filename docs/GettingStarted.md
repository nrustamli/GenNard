# Getting Started

This guide walks you through cloning, running, and evaluating GenNard locally. By the end you will have the client, server, and game engine all running on your machine.

## Prerequisites

- **Node.js 22+** (check with `node -v`)
- **npm 10+** (ships with Node 22)
- **Git**
- **HuggingFace account** with an API token — sign up at [huggingface.co](https://huggingface.co) and create a token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens). The free tier works.

## 1. Clone the repo

```bash
git clone https://github.com/nrustamli/GenNard.git
cd GenNard
```

## 2. Install dependencies

This is an npm workspaces monorepo. A single install at the root handles all four packages (client, server, game-engine, shared):

```bash
npm install
```

## 3. Build the game engine

The client and server both depend on `@gennard/game-engine`. It must be built before anything else:

```bash
npm run build -w packages/game-engine
```

## 4. Configure the server

Create a `.env` file inside `packages/server/`:

```bash
cat > packages/server/.env << 'EOF'
HF_TOKEN=hf_your_token_here
EOF
```

Replace `hf_your_token_here` with your HuggingFace API token. The server will refuse to start without it.

## 5. Start the dev servers

Open two terminal tabs and run:

**Terminal 1 — Backend (port 4000):**
```bash
npm run dev:server
```

**Terminal 2 — Frontend (port 3000):**
```bash
npm run dev:client
```

The Vite dev server proxies `/api` requests to `localhost:4000`, so both servers must be running.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Try it out

1. Type a theme prompt on the landing page (e.g. "Cats vs Dogs")
2. Pick a style mode (classic or creative)
3. Click Generate — the server calls HuggingFace to create checker textures, a board texture, and a color palette. First generation takes 10-30 seconds depending on API load.
4. Once generated, you land on the game page with a 3D backgammon board styled to your theme
5. Roll dice and play — click a checker to select it, then click a destination point to move

Subsequent requests with the same prompt return instantly (results are cached on disk in `packages/server/generated/`).

## Running Tests

The game engine has a Vitest test suite covering board logic, move generation, bearing off, and game state:

```bash
# Single run
npm test

# Watch mode
npm run test:watch
```

Tests are located in `packages/game-engine/tests/`.

## Full Production Build

To build all packages (game-engine, server, client) in the correct order:

```bash
npm run build
```

This compiles TypeScript for the game engine and server, then runs `vite build` for the client. The client output lands in `packages/client/dist/`.

To preview the production client build locally:

```bash
npm run preview -w packages/client
```

## Project Layout at a Glance

| Path | What it is |
|------|-----------|
| `packages/client/` | React + Three.js frontend. Vite dev server on port 3000. |
| `packages/server/` | Express API. Handles AI theme generation via HuggingFace. Port 4000. |
| `packages/game-engine/` | Pure TypeScript backgammon rules. No runtime deps. Consumed by client and server. |
| `packages/shared/` | Shared TypeScript types (theme response shape, style modes). |
| `Dockerfile` | Multi-stage build for Cloud Run deployment (server only). |
| `firebase.json` | Firebase Hosting config. Serves client and proxies `/api/**` to Cloud Run. |
| `cloudbuild.yaml` | GCP Cloud Build pipeline — builds Docker image, pushes to registry, deploys to Cloud Run. |

## Key Dev Workflows

### Editing game rules

All game logic lives in `packages/game-engine/src/`. After making changes, rebuild it so the client picks up the update:

```bash
npm run build -w packages/game-engine
```

In dev mode the client hot-reloads, but since the game engine is a pre-built dependency, you need to rebuild it manually when you change it.

### Editing the UI

Changes in `packages/client/src/` are picked up instantly by Vite's HMR — no rebuild needed.

### Editing the server

The server runs with `tsx watch`, so changes in `packages/server/src/` auto-restart the process.

### Clearing the theme cache

Generated themes are cached in `packages/server/generated/`. To force regeneration:

```bash
rm -rf packages/server/generated/*
```

## Deployment

The app is deployed as two services:

- **Client** — Firebase Hosting. Deploy with `firebase deploy --only hosting` after running `npm run build`.
- **Server** — Google Cloud Run. Deployed automatically via Cloud Build when changes are pushed (`cloudbuild.yaml`). The `HF_TOKEN` secret is injected from Google Secret Manager.

Firebase rewrites `/api/**` requests to the Cloud Run service, so both services share the same domain in production.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `HF_TOKEN is required` | Create `packages/server/.env` with your HuggingFace token |
| `Cannot find module '@gennard/game-engine'` | Run `npm run build -w packages/game-engine` |
| Client shows network errors | Make sure the server is running on port 4000 |
| Theme generation is slow | First call hits HuggingFace APIs (~10-30s). Same prompt is cached after that. |
| Port 3000 or 4000 in use | Kill the process using the port or change it in `vite.config.ts` / `packages/server/src/index.ts` |
