# ----------- STAGE 1: BUILD -----------
FROM oven/bun:1.0 as builder

WORKDIR /app

# 1. Copy only package manifests first (for better caching)
COPY package.json bun.lockb ./

# 2. Install dependencies
RUN bun install

# 3. Now copy the rest of your source code
COPY . .

# 4. Build your project
RUN bun build index.ts --target bun --outfile server.js

# ----------- STAGE 2: RUN -----------
FROM oven/bun:1.0-slim

WORKDIR /app

# 5. Copy only the compiled server.js from builder stage
COPY --from=builder /app/server.js .

# 6. Expose port 3000 (optional, but good convention)
EXPOSE 3000

# 7. Start the server
CMD ["bun", "server.js"]
