# Backend - Express + TypeScript + Socket.io
FROM oven/bun:alpine

WORKDIR /workspace/services/backend

# Copy & install local deps
COPY package.json bun.lockb* ./

RUN bun install

# Copy source
COPY . .

EXPOSE 4000

# Healthcheck (basic; add /health route if needed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000 || exit 1

# Shell form for Bun script
CMD bun run dev
