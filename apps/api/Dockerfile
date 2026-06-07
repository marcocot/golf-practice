# Build context is the repo root.
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --filter @golf/api...
COPY apps/api ./apps/api
WORKDIR /repo/apps/api
RUN pnpm prisma generate && pnpm build

FROM node:22-alpine AS runtime
RUN corepack enable
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo ./
WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]
