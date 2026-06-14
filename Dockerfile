# Montar
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos todo el contenido local (incluyendo node_modules de tu máquina)
COPY . .

# Compilamos la aplicación NestJS
RUN npm run build

# correr
FROM node:22-alpine AS runner

WORKDIR /app

# Copiamos la aplicación compilada y el node_modules ya listos desde la etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env* ./
COPY package.json ./

EXPOSE 3001

CMD ["node", "dist/main"]
