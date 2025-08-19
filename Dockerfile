# Этап deps: Установка зависимостей
FROM node:20-alpine AS deps
WORKDIR /src

COPY package.json package-lock.json* ./
RUN npm ci

# Этап builder: Сборка приложения
FROM node:20-alpine AS builder
WORKDIR /src

COPY --from=deps /src/node_modules ./node_modules
COPY . .
RUN npm run build

# Этап runner: Финальный образ
FROM node:20-alpine AS runner
WORKDIR /src

COPY --from=builder --chown=node:node /src/dist ./dist
COPY --from=builder --chown=node:node /src/node_modules ./node_modules

USER node

CMD ["node", "dist/main.js"]