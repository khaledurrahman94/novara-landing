import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public URL of the CMS (admin and API), for example https://cms.example.com. Empty in local dev.
  url: env('PUBLIC_URL', ''),
  // Trust X-Forwarded-* headers when a reverse proxy terminates TLS in front of Strapi.
  proxy: { koa: env.bool('IS_PROXIED', false) },
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  logger: { updates: { enabled: false } },
  mcp: { enabled: false },
});

export default config;
