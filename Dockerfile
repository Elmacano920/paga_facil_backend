# ── STAGE 1: Build ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (capa cacheada)
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --ignore-scripts

# Copiar código fuente y compilar
COPY . .
RUN pnpm run build

# ── STAGE 2: Production runner ──────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Solo dependencias de producción
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod --ignore-scripts

# Copiar build compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
