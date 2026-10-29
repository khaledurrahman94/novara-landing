/**
 * Content Layer: Strapi is the source of truth. Each collection mirrors a contract in
 * docs/implementation/05-cms.md. A schema mismatch fails the build. Add later content types in
 * src/lib/collections.ts and list them here.
 */
import { defineCollection } from 'astro:content';
import { strapiLoader } from './lib/strapi-loader';
import { redirectCollection, siteSettingsCollection } from './lib/collections';
import { redirectSchema, siteSettingsSchema } from './lib/schemas';

export const collections = {
  'site-settings': defineCollection({ loader: strapiLoader(siteSettingsCollection), schema: siteSettingsSchema }),
  redirect: defineCollection({ loader: strapiLoader(redirectCollection), schema: redirectSchema }),
};
