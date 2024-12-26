# Build backend
FROM oven/bun:1.0 AS backend-builder
WORKDIR /app/backend
# Ensure the files exist before copying
COPY backend/package.json ./package.json
COPY backend/bun.lockb ./bun.lockb
RUN bun install --frozen-lockfile
COPY backend ./
RUN bun build index.ts --target bun --outfile server.js

# Build frontend
FROM oven/bun:1.0 AS frontend-builder
WORKDIR /app/frontend
# Ensure the files exist before copying
COPY web/package.json ./package.json
COPY web/bun.lockb ./bun.lockb
RUN bun install --frozen-lockfile
COPY web ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production image
FROM oven/bun:1.0-slim
WORKDIR /app

# Create directories
RUN mkdir -p backend frontend/public frontend/.next/static

# Copy backend
COPY --from=backend-builder /app/backend/server.js ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy frontend
COPY --from=frontend-builder /app/frontend/.next/standalone/. ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static/. ./frontend/.next/static/
COPY --from=frontend-builder /app/frontend/public/. ./frontend/public/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

# Create and copy the start script
RUN echo '#!/bin/sh\n\n# Start the backend\ncd /app/backend && bun server.js &\n\n# Wait a moment for backend to start\nsleep 2\n\n# Start the frontend\ncd /app/frontend && bun server.js' > /app/start.sh \
    && chmod +x /app/start.sh

EXPOSE 3000 3001

CMD ["/app/start.sh"] 