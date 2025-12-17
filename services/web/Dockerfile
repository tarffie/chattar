# Frontend - React + TypeScript + Vite (Bun on glibc)
FROM oven/bun:alpine

WORKDIR /workspace/services/web

# Copy & install local deps
COPY package.json bun.lockb* ./
RUN bun install

# Copy source
COPY . .

EXPOSE 5173

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

# Shell form for Bun subcommand
CMD bunx vite --host 0.0.0.0 --port 5173
