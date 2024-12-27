FROM oven/bun:1.0

WORKDIR /app

# Install OpenSSL 3.0
RUN apt-get update && apt-get install -y openssl libssl3

# Create directory structure
RUN mkdir -p packages/api packages/backend

# Copy API package
COPY ../api/package.json ./packages/api/
COPY ../api/*.ts ./packages/api/

# Copy backend package
COPY package.json ./packages/backend/
COPY bun.lockb ./packages/backend/
COPY . ./packages/backend/

# Copy root workspace files
COPY ../../package.json .
COPY ../../bun.lockb .

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