# ─── Stage 1: Build the React client ──────────────────────────────────────────
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy client package files first (layer cache)
COPY client/package*.json ./

# Install client dependencies
RUN npm install

# Copy client source
COPY client/ ./

# Build the React app with increased memory
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

# ─── Stage 2: Production server ───────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend production dependencies only
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy database schema
COPY database/ ./database/

# Copy built React app from stage 1
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "backend/server.js"]
