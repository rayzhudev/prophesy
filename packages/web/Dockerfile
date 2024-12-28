FROM oven/bun:1 as base

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y libc6
WORKDIR /app

# Create workspace structure
COPY . .

# Install dependencies with cache mounting for faster builds
RUN --mount=type=cache,id=s/cb43f723-8ac2-4090-970e-a327fa078ca3-/bun/deps,target=/root/.bun \
    bun install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy everything from deps stage
COPY --from=deps /app ./

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build using the same command as local development
RUN --mount=type=cache,id=s/cb43f723-8ac2-4090-970e-a327fa078ca3-/bun/build,target=/root/.bun \
    bun run build:railway-web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user with minimal permissions
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs && \
    mkdir -p /app/packages/web/.next/cache && \
    chown -R nextjs:nodejs /app

# Copy root package.json and workspace files
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/bun.lockb ./bun.lockb

# Create web package directory and copy files
RUN mkdir -p packages/web
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/package.json ./packages/web/
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/public ./packages/web/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/static ./packages/web/.next/static

# Set proper permissions
RUN chmod -R 550 /app && \
    chmod -R 770 /app/packages/web/.next/cache

# Use non-root user
USER nextjs

# Expose port and set host for better container security
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Set working directory to web package
WORKDIR /app/packages/web

# Use node to run the standalone server
CMD ["node", "server.js"]