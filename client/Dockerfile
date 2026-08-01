# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments and environment variables
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build static production bundle
RUN npm run build

# Production Stage
FROM node:22-alpine AS runner
WORKDIR /app

# Install lightweight static HTTP server
RUN npm install -g serve

# Copy built static assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000 for ALB routing
EXPOSE 3000

# Serve Single Page Application
CMD ["serve", "-s", "dist", "-l", "3000"]
