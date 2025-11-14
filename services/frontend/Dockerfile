# Frontend - React + TypeScript + Vite (Bun on glibc)
FROM node:20-bookworm-slim

# Install Bun
RUN apt-get update -qq && \
    apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    mv /root/.bun /bun

ENV PATH="/bun/bin:$PATH"

WORKDIR /workspace/services/frontend

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
CMD bun x vite --host 0.0.0.0 --port 5173
