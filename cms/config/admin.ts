import type { Core } from '@strapi/strapi';
import { originOf, previewHandler } from '../src/lib/preview';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const siteUrl = env('SITE_URL', '');
  const previewSecret = env('PREVIEW_SECRET', '');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET')!,
    },
    apiToken: {
      salt: env('API_TOKEN_SALT')!,
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT')!,
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY')!,
    },
    flags: {
      nps: env.bool('FLAG_NPS', false),
      promoteEE: env.bool('FLAG_PROMOTE_EE', false),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
    },
    // Editors get a Preview button that opens `${SITE_URL}/preview/<path>?secret=${PREVIEW_SECRET}`.
    // Off until both variables are set.
    preview: {
      enabled: Boolean(siteUrl && previewSecret),
      config: {
        allowedOrigins: siteUrl ? [originOf(siteUrl)] : [],
        handler: previewHandler(siteUrl, previewSecret),
      },
    },
  };
};

export default config;
