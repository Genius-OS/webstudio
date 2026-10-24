FROM node:22-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate && pnpm install --frozen-lockfile
RUN pnpm --filter=@webstudio-is/http-client... build
RUN pnpm --filter=@webstudio-is/builder build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app ./
WORKDIR /app/apps/builder
ENV PORT=5176
ENV HOST=0.0.0.0
EXPOSE 5176
CMD ["bash", "-c", "cd /app/apps/builder && set -a && if [ -f ./.env ]; then . ./.env; fi && if [ -f ./.env.development ]; then . ./.env.development; fi && set +a && export PORT=5176 HOST=0.0.0.0 && exec ./node_modules/.bin/remix-serve ./build/server/nodejs-*/index.js"]
