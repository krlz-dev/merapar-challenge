# Use official Node.js runtime as base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run astro
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy the standalone output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/data ./src/data

# Create the data directory and set permissions
RUN mkdir -p /app/src/data && chown -R astro:nodejs /app/src/data

USER astro

EXPOSE 4321

ENV HOST=0.0.0.0
ENV PORT=4321

# Start the application
CMD ["node", "./dist/server/entry.mjs"]