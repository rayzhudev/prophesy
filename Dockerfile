# Base image for both frontend and backend
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install backend dependencies into temp directory
FROM base AS backend-deps
RUN mkdir -p /temp/backend
COPY backend/package.json /temp/backend/
RUN cd /temp/backend && bun install --frozen-lockfile

# Build backend
FROM base AS backend-builder
COPY --from=backend-deps /temp/backend/node_modules node_modules
COPY backend .
RUN bun build index.ts --target bun --outfile server.js

# Install frontend dependencies
FROM base AS frontend-deps
RUN mkdir -p /temp/frontend
COPY web/package.json /temp/frontend/
RUN cd /temp/frontend && bun install --frozen-lockfile --production

# Build frontend
FROM base AS frontend-builder
COPY --from=frontend-deps /temp/frontend/node_modules node_modules
COPY web .
ENV NODE_ENV=production
RUN bun run build

# Final image
FROM base AS release
WORKDIR /app

# Copy backend
COPY --from=backend-builder /usr/src/app/server.js backend/
COPY --from=backend-deps /temp/backend/node_modules backend/node_modules

# Copy frontend
COPY --from=frontend-builder /usr/src/app/.next/standalone frontend/
COPY --from=frontend-builder /usr/src/app/.next/static frontend/.next/static
COPY --from=frontend-builder /usr/src/app/public frontend/public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_BACKEND_URL=/api
ENV HOSTNAME="0.0.0.0"

# Create start script
RUN echo '#!/bin/sh\n\n# Start the backend\ncd /app/backend && bun server.js &\n\n# Wait a moment for backend to start\nsleep 2\n\n# Start the frontend\ncd /app/frontend && exec bun server.js' > /app/start.sh \
    && chmod +x /app/start.sh

# Switch to non-root user
USER bun

EXPOSE 3000 3001

CMD ["/app/start.sh"] 