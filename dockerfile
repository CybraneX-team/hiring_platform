# Base image
FROM node:22-alpine AS base

# -----------------------------
# Dependencies stage
# -----------------------------
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# -----------------------------
# Build stage
# -----------------------------
FROM base AS builder
WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OLA_MAPS_API_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_OLA_MAPS_API_KEY=$NEXT_PUBLIC_OLA_MAPS_API_KEY

# Copy all source files and dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure Next.js can read TypeScript config
# (Next.js compiles next.config.ts automatically — no manual conversion needed)

# Build Next.js
RUN npm run build

# -----------------------------
# Production stage
# -----------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create target dirs
RUN mkdir -p /app/.next/static /app/public

# Copy compiled output and config
COPY --from=builder /app/.next/standalone /app/
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public /app/public
COPY --from=builder /app/next.config.ts /app/next.config.ts  # ✅ use TS config

EXPOSE 3000

CMD ["node", "server.js"]
