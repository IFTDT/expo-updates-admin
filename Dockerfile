# syntax=docker/dockerfile:1.7

FROM node:20-slim AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ARG NPM_REGISTRY=https://registry.npmmirror.com/
RUN corepack enable \
  && npm config set registry ${NPM_REGISTRY} \
  && pnpm config set registry ${NPM_REGISTRY}

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN pnpm install --frozen-lockfile && pnpm --filter web build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV HOME=/home/appuser
ENV COREPACK_HOME=/home/appuser/.cache/node/corepack

RUN corepack enable \
  && groupadd -r nodejs \
  && useradd -r -g nodejs -m -d /home/appuser appuser \
  && mkdir -p /home/appuser/.cache/node/corepack \
  && chown -R appuser:nodejs /home/appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
# COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY --from=build /app/packages ./packages
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN chown -R appuser:nodejs /app
USER appuser

EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start", "-H", "0.0.0.0", "-p", "3000"]
