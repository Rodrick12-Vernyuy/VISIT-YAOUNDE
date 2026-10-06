# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN --mount=type=cache,id=s/523cb6f9-ffb6-44e9-a300-9a2c3e42b37a-/root/.npm,target=/root/.npm,sharing=locked npm install --prefer-offline --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --fetch-timeout=300000 --no-audit --no-fund

FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY package*.json ./
RUN --mount=type=cache,id=s/523cb6f9-ffb6-44e9-a300-9a2c3e42b37a-/root/.npm,target=/root/.npm,sharing=locked npm install --omit=dev --prefer-offline --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --fetch-timeout=300000 --no-audit --no-fund
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 4004
CMD ["sh", "-c", "node dist/scripts/migrate.js && node dist/server.js"]
