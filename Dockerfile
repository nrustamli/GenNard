# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package*.json ./
COPY packages/game-engine/package*.json ./packages/game-engine/
COPY packages/server/package*.json       ./packages/server/
COPY shared/package*.json                ./shared/

RUN npm ci

# Copy shared tsconfig (extended by all packages)
COPY tsconfig.base.json ./

# Build game-engine (server depends on it)
COPY packages/game-engine ./packages/game-engine
COPY shared               ./shared
RUN npm run build -w packages/game-engine

# Build server
COPY packages/server ./packages/server
RUN npm run build -w packages/server

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/node_modules                      ./node_modules
COPY --from=builder /app/package.json                      ./package.json
COPY --from=builder /app/shared                            ./shared
COPY --from=builder /app/packages/game-engine/dist         ./packages/game-engine/dist
COPY --from=builder /app/packages/game-engine/package.json ./packages/game-engine/package.json
COPY --from=builder /app/packages/server/dist              ./packages/server/dist
COPY --from=builder /app/packages/server/package.json      ./packages/server/package.json

# Cloud Run injects PORT automatically
ENV PORT=8080
EXPOSE 8080

# rootDir is the monorepo root, so tsc mirrors the full path
CMD ["node", "packages/server/dist/packages/server/src/index.js"]
