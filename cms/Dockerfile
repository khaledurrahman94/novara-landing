# syntax=docker/dockerfile:1.7
# Novara CMS (Strapi 5). Build from the REPO ROOT, because the seed reads the site's copy files:
#   docker build -f cms/Dockerfile -t novara-cms .
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    STRAPI_TELEMETRY_DISABLED=true
RUN corepack enable
WORKDIR /app

# All dependencies, for the build.
FROM base AS deps
COPY cms/package.json cms/pnpm-lock.yaml cms/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

# Compile TypeScript and build the admin panel.
FROM deps AS build
COPY cms/ ./
RUN pnpm build

# Runtime dependencies only (no sqlite, no dev tooling).
FROM base AS prod-deps
COPY cms/package.json cms/pnpm-lock.yaml cms/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --prod

FROM base AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337 \
    SEED_SRC_DIR=/seed
RUN chown node:node /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json /app/tsconfig.json /app/favicon.png ./
COPY --from=build --chown=node:node /app/dist ./dist
# Source and config stay so Strapi's CLI works in the container (admin:create-user, admin:reset-user-password).
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/config ./config
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/database ./database
COPY --from=build --chown=node:node /app/scripts ./scripts
# Copy the seed reads (npm run seed). Same layout as the repo, so no path changes.
COPY --chown=node:node src/content/home.ts /seed/src/content/
COPY --chown=node:node public/robots.txt /seed/public/robots.txt
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads

USER node
EXPOSE 1337
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||1337)+'/_health').then(r=>process.exit(r.status===204?0:1)).catch(()=>process.exit(1))"
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
