FROM node:24-alpine AS build

WORKDIR /workspace
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @humanqa/site build

FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY apps/site/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/site/dist/ /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

