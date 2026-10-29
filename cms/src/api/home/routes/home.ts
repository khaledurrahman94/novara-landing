import { factories } from '@strapi/strapi';

/** Read-only over REST: the site build only ever fetches. Edits go through the admin. */
export default factories.createCoreRouter('api::home.home', {
  only: ['find'],
  config: { find: { middlewares: ['api::home.populate'] } },
});
