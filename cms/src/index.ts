import type { Core } from '@strapi/strapi';
import { ensureMarketingRole } from './lib/marketing-role';
import { flushRebuild, registerRebuildTrigger } from './lib/rebuild';
import { registerSeoGuard } from './lib/seo-guard';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    registerSeoGuard(strapi);
    registerRebuildTrigger(strapi);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureMarketingRole(strapi);
  },

  async destroy({ strapi }: { strapi: Core.Strapi }) {
    await flushRebuild(strapi);
  },
};
