#!/bin/sh

# Start the backend in the background
cd /app/backend && bun server.js &

# Start the frontend
cd /app/frontend && bun server.js 