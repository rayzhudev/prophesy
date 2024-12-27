FROM oven/bun:1.0

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

# Generate Prisma client
WORKDIR /app/packages/backend
RUN bun run db:generate

# Build the application
RUN bun build ./index.ts --outdir ./dist --target node

# Expose the port
EXPOSE 3000

# Start the server
CMD ["bun", "run", "start"] 