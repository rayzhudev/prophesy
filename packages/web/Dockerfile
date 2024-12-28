FROM node:20-alpine AS base

# Install bun globally in the base image
RUN npm install -g bun

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only package files needed for installation
COPY package.json bun.lockb ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Install dependencies with cache mounting for faster builds
RUN --mount=type=cache,id=s/cb43f723-8ac2-4090-970e-a327fa078ca3-/bun/deps,target=/app/node_modules \
    bun install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies and source files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/web/node_modules ./packages/web/node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build using the same command as local development
RUN --mount=type=cache,id=s/cb43f723-8ac2-4090-970e-a327fa078ca3-/bun/build,target=/app/.next \
    bun run build:railway-web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user with minimal permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app

# Copy only the necessary files
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Set proper permissions
RUN chmod -R 550 /app && \
    chmod -R 770 /app/.next/cache

# Use non-root user
USER nextjs

# Expose port and set host for better container security
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Use the same start command as local development
CMD ["bun", "run", "start:web"] 