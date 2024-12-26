FROM oven/bun:1.0 AS builder
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy source code
COPY . .

# Build the app
RUN bun run build

# Production image
FROM oven/bun:1.0-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001

CMD ["bun", "server.js"] 