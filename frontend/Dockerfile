FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_CHAT_WS_URL=ws://localhost:5000
ENV NEXT_PUBLIC_CHAT_WS_URL=${NEXT_PUBLIC_CHAT_WS_URL}
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_CHAT_WS_URL=ws://localhost:5000
ENV NEXT_PUBLIC_CHAT_WS_URL=${NEXT_PUBLIC_CHAT_WS_URL}
# Without this, Next.js's standalone server can bind to localhost only,
# which the app itself can reach (so it logs "Ready"/"live") but which is
# unreachable from outside the container — exactly the shape of bug where
# the platform's proxy gets an immediate connection-refused on every
# request despite a clean-looking boot log.
ENV HOSTNAME="0.0.0.0"
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
