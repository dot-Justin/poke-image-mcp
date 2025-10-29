# Use Node.js LTS version
FROM node:20-slim

# Install dependencies needed for sharp (native image processing library)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Create images directory
RUN mkdir -p /app/images

# Expose port (Smithery uses 8081)
EXPOSE 8081

# Set environment variable for port
ENV PORT=8081

# Start the server
CMD ["node", "dist/index.js"]
