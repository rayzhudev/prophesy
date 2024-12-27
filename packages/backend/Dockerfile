FROM ubuntu:22.04

# Install Bun
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

# Install OpenSSL 3.0
RUN apt-get update && apt-get install -y openssl libssl3

# Create directory structure
RUN mkdir -p packages/api packages/backend

# Copy workspace files first
COPY package.json .
COPY bun.lockb .

# Copy API package
COPY packages/api/package.json ./packages/api/
COPY packages/api/*.ts ./packages/api/

# Copy backend package
COPY packages/backend/package.json ./packages/backend/
COPY packages/backend/bun.lockb ./packages/backend/
COPY packages/backend/ ./packages/backend/

# Install dependencies
RUN bun install

# Build API package first
WORKDIR /app/packages/api
RUN bun build ./router.ts --outdir ./dist --target node

# Generate Prisma client
WORKDIR /app/packages/backend
RUN bun run db:generate

# Build the backend
RUN bun build ./index.ts --outdir ./dist --target node \
    --external @prisma/client \
    --external prisma

# Expose the port
EXPOSE 3000

# Start the server
CMD ["bun", "run", "start"] 