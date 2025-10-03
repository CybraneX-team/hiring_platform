FROM node:22-alpine AS base

# Install dependencies stage
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

# Accept build arguments for Next.js public env vars
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OLA_MAPS_API_KEY

# Set as environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_OLA_MAPS_API_KEY=$NEXT_PUBLIC_OLA_MAPS_API_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create next.config.js with proper syntax
RUN echo 'const nextConfig = { output: "standalone" }; module.exports = nextConfig;' > next.config.js

# Build Next.js with env vars
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
