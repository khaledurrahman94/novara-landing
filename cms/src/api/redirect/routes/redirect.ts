import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::redirect.redirect', { only: ['find', 'findOne'] });
