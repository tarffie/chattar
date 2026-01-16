# Frontend - React + TypeScript + Vite (Bun on glibc)
FROM oven/bun:alpine
RUN apk update && apk upgrade && apk add --no-cache curl

WORKDIR /workspace
COPY package.json bun.lockb* ./
COPY shared ./shared
COPY services/web ./services/web
RUN bun install

WORKDIR /workspace/services/web
RUN bun install
EXPOSE 5173

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

# Shell form for Bun subcommand
CMD ["bunx","vite","--host","0.0.0.0","--port","5173"]
