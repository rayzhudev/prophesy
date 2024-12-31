# Stage 1: Builder
FROM ubuntu:22.04 as builder

# Install Bun
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:${PATH}"

# Install Prisma CLI globally
RUN bun install -g prisma

WORKDIR /app

# Install OpenSSL 3.0
RUN apt-get update && apt-get install -y openssl libssl3

# Create directory structure
RUN mkdir -p packages/api packages/backend packages/eslint-config-custom

# Copy workspace files first
COPY package.json .
COPY bun.lockb .

# Copy eslint-config-custom package
COPY packages/eslint-config-custom/package.json ./packages/eslint-config-custom/
COPY packages/eslint-config-custom/*.js ./packages/eslint-config-custom/

# Copy API package
COPY packages/api/package.json ./packages/api/
COPY packages/api/*.ts ./packages/api/

# Copy backend package
COPY packages/backend/package.json ./packages/backend/
COPY packages/backend/ ./packages/backend/

# Install root dependencies
RUN bun install

# Install backend dependencies
WORKDIR /app/packages/backend
RUN bun install

# Build API package first
WORKDIR /app/packages/api
RUN bun build ./router.ts --outdir ./dist --target node

# Generate Prisma client
WORKDIR /app/packages/backend
RUN bun run db:generate

# Build the backend
RUN bun build ./src/index.ts --outdir ./dist --target node \
    --external @prisma/client \
    --external prisma

# Stage 2: Runtime
FROM ubuntu:22.04

# Install Bun and OpenSSL
RUN apt-get update && apt-get install -y curl unzip openssl libssl3 && \
    curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

# Copy package files and install dependencies
COPY --from=builder /app/package.json .
COPY --from=builder /app/bun.lockb .
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/api/package.json ./packages/api/
COPY --from=builder /app/packages/eslint-config-custom/package.json ./packages/eslint-config-custom/
COPY --from=builder /app/packages/eslint-config-custom/*.js ./packages/eslint-config-custom/

# Copy Prisma files
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/

# Copy the built files
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/api/dist ./packages/api/dist

# Install production dependencies
RUN bun install --production

WORKDIR /app/packages/backend

# Expose the port
EXPOSE 3000

# Start the server
CMD ["bun", "run", "dist/index.js"]
