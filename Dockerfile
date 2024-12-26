# Build backend
FROM oven/bun:1.0 AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/bun.lockb ./
RUN bun install
COPY backend .
RUN bun build index.ts --target bun --outfile server.js

# Build frontend
FROM oven/bun:1.0 AS frontend-builder
WORKDIR /app/frontend
COPY web/package.json web/bun.lockb ./
RUN bun install
COPY web .
RUN bun run build

# Production image
FROM oven/bun:1.0-slim
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/server.js ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy frontend
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static

# Set environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=3000
ENV FRONTEND_PORT=3001
ENV HOSTNAME="0.0.0.0"

# Copy start script
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 3000 3001

CMD ["./start.sh"] 