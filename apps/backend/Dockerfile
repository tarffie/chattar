FROM oven/bun:alpine

RUN apk update &&   \
apk upgrade &&      \
apk add --no-cache curl

WORKDIR /app

COPY ./shared /app/shared

COPY ./services/backend/package.json ./services/backend/bun.lockb* /app/
COPY ./services/backend /app/

RUN bun install

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["bun", "run", "dev"]
