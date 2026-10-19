import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::site-settings.site-settings', {
  only: ['find'],
  config: { find: { middlewares: ['api::site-settings.populate'] } },
});
