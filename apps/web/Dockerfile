# Build context is the repo root.
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --filter @golf/web...
COPY apps/web ./apps/web
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_AUTH_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
WORKDIR /repo/apps/web
RUN pnpm build

FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
