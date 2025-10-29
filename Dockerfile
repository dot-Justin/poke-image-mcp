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

# Copy source code (needed before npm install due to prepare script)
COPY src/ ./src/

# Install dependencies (this will also run the build via prepare script)
RUN npm ci --production=false

# Create images directory and copy image files
RUN mkdir -p /app/images
COPY images/ ./images/

# Expose port (Smithery uses 8081)
EXPOSE 8081

# Set environment variable for port
ENV PORT=8081

# Start the server
CMD ["node", "dist/index.js"]
