# ============================================
# TalentTrack Portal - Backend Dockerfile
# ============================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY src/ ./src/

# Create non-root user for security
RUN addgroup -g 1001 -S talenttrack && \
    adduser -S talenttrack -u 1001 -G talenttrack

USER talenttrack

# Expose the API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "src/app.js"]
