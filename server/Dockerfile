# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifests and Prisma config
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client & compile TypeScript
RUN npx prisma generate
RUN npx tsc

# Production Stage
FROM node:22-alpine AS runner
WORKDIR /app

# Copy dependency manifests, production node_modules, compiled dist, and prisma config
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Execute database migrations/push and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
