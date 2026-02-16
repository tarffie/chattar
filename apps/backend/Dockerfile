FROM oven/bun:alpine

RUN apk update &&   \
apk upgrade &&      \
apk add --no-cache curl

WORKDIR /app

COPY ./shared /app/shared

COPY ./apps/backend/package.json ./apps/backend/bun.lockb* /app/
COPY ./apps/backend /app/

RUN bun install

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["bun", "run", "dev"]
