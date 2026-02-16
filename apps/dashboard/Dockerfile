# Dashboard component Service
FROM oven/bun:alpine

RUN ["apk","update"]
RUN ["apk","upgrade"]
RUN ["apk","add","--no-cache","curl"]

WORKDIR /workspace
COPY package.json bun.lockb* ./
COPY shared ./shared
COPY apps/dashboard ./apps/dashboard
WORKDIR /workspace/apps/dashboard

RUN bun install

WORKDIR /workspace/apps/dashboard
RUN bun install

EXPOSE 5171

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5171 || exit 1

# Shell form for Bun subcommand
CMD ["bunx","vite","--host","0.0.0.0","--port","5171"]
