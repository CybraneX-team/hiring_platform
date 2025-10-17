FROM node:22-alpine AS base

# Dependencies layer
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build layer
FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OLA_MAPS_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_OLA_MAPS_API_KEY=$NEXT_PUBLIC_OLA_MAPS_API_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Overwrite or create next.config.js if needed
RUN echo 'const nextConfig = { output: "standalone" }; module.exports = nextConfig;' > next.config.js
RUN npm run build

# Production (runner) layer
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./  # Copy your config into the runner stage

EXPOSE 3000
CMD ["node", "server.js"]
