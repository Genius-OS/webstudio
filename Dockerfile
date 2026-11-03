FROM node:22-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate && pnpm install --frozen-lockfile
RUN pnpm --filter=@webstudio-is/http-client... build
RUN pnpm --filter=@webstudio-is/builder build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app ./
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN rm -f /app/apps/builder/.env /app/apps/builder/.env.development
WORKDIR /app/apps/builder
ENV PORT=5176
ENV HOST=0.0.0.0
EXPOSE 5176
CMD ["node", "server.mjs"]
