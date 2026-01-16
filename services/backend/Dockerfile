FROM oven/bun:alpine

RUN ["apk","update"]
RUN ["apk","upgrade"]
RUN ["apk","add","--no-cache","curl"]

WORKDIR /workspace
COPY package.json bun.lockb* ./
COPY shared ./shared
COPY services/backend ./services/backend
RUN bun install

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000 || exit 1

# Run from workspace root
CMD ["bun", "run", "--cwd", "services/backend", "dev"]
