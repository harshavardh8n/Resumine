# Stage 1: Build & Production Image
FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies needed for native modules if any
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY src ./src
COPY index.js ./

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start server
CMD ["node", "src/server.js"]

