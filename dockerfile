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

# Accept build arguments for env vars
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OLA_MAPS_API_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_OLA_MAPS_API_KEY=$NEXT_PUBLIC_OLA_MAPS_API_KEY

# Copy deps & source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js (will now generate .next/standalone)
RUN npm run build

# -----------------------------
# Production stage
# -----------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create required dirs
RUN mkdir -p /app/.next/static /app/public

# Copy built output from builder
COPY --from=builder /app/.next/standalone /app/
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public /app/public
COPY --from=builder /app/next.config.ts /app/next.config.ts

# Expose app port
EXPOSE 3000

# Run standalone Next.js server
CMD ["node", "server.js"]
