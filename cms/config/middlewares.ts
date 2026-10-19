import type { Core } from '@strapi/strapi';
import { originOf } from '../src/lib/preview';

/** Hosts the admin may load media from, and the site origin the Preview pane may frame. */
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  const siteOrigin = originOf(env('SITE_URL', ''));
  const mediaOrigins = [env('S3_PUBLIC_URL', ''), env('S3_ENDPOINT', '')].map(originOf).filter(Boolean);

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', ...mediaOrigins],
            'media-src': ["'self'", 'data:', 'blob:', ...mediaOrigins],
            'frame-src': ["'self'", ...(siteOrigin ? [siteOrigin] : [])],
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
