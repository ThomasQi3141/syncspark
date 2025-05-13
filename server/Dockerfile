# Use a lightweight Node.js image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# --- Production image ---
FROM node:20-alpine
WORKDIR /app

# Copy only the built output and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Expose port (default 3001)
EXPOSE 3001

# Command to run the app
CMD ["node", "dist/index.js"] 