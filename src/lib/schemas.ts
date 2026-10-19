/**
 * Zod schemas mirroring the shared contracts in docs/implementation/05-cms.md. Keep them exact:
 * a mismatch fails the build. Length caps match the Strapi schemas in cms/.
 * Strapi sends `null` (or "") for empty optional fields; both read as "not set".
 */
import { z } from 'astro/zod';

const empty = (v: unknown) => (v === null || v === '' ? undefined : v);
const opt = <T extends z.ZodType>(s: T) => z.preprocess(empty, s.optional());

/** Strapi 5 media entry (the part of the upload object the site uses). */
export const mediaSchema = z.object({
  id: opt(z.number()),
  documentId: opt(z.string()),
  name: opt(z.string()),
  alternativeText: opt(z.string()),
  url: z.string().min(1),
  width: opt(z.number()),
  height: opt(z.number()),
  mime: z.string().min(1),
});
export type Media = z.output<typeof mediaSchema>;

/** `seo.meta` fields typed as media must be images. */
export const imageSchema = mediaSchema.refine((m) => m.mime.startsWith('image/'), { message: 'must be an image (image/*)', path: ['mime'] });

const rootOrAbsolute = (v: string) => (v.startsWith('/') && !v.startsWith('//')) || /^https?:\/\//.test(v);

/** Component `seo.meta`, on every page type. */
export const seoMetaSchema = z.object({
  metaTitle: opt(z.string().trim().max(70)),
  metaDescription: z.string().trim().min(50).max(170),
  focusKeyword: opt(z.string().max(60)),
  keywords: opt(z.string().max(255)),
  canonicalUrl: opt(z.string().refine(rootOrAbsolute, { message: 'must be root-relative (/path) or an absolute URL' })),
  index: z.preprocess(empty, z.boolean().default(true)),
  follow: z.preprocess(empty, z.boolean().default(true)),
  ogTitle: opt(z.string().max(90)),
  ogDescription: opt(z.string().max(200)),
  ogImage: opt(imageSchema),
  structuredData: opt(
    z.record(z.string(), z.unknown()).refine(
      (o) => typeof o['@type'] === 'string' || (Array.isArray(o['@type']) && o['@type'].length > 0),
      { message: 'must be an object with an "@type"' },
    ),
  ),
  breadcrumbLabel: opt(z.string().max(40)),
});
export type SeoMeta = z.output<typeof seoMetaSchema>;

/** Single type `site-settings`. */
export const siteSettingsSchema = z.object({
  documentId: opt(z.string()),
  updatedAt: opt(z.string()),
  siteName: z.preprocess(empty, z.string().min(1).default('Novara')),
  titleTemplate: z.preprocess(
    empty,
    z.string().refine((t) => t.includes('%s'), { message: 'must contain %s, where the page title goes' }).default('%s | Novara'),
  ),
  defaultOgImage: opt(imageSchema),
  robotsTxt: z.string().trim().min(1),
});
export type SiteSettings = z.output<typeof siteSettingsSchema>;

/** Collection `redirect`. */
export const redirectSchema = z.object({
  documentId: opt(z.string()),
  from: z.string().regex(/^\/[a-z0-9/_-]*$/, 'must match ^/[a-z0-9/_-]*$'),
  to: z.string().min(1).refine((v) => (v.startsWith('/') && !v.startsWith('//')) || v.startsWith('https://'), {
    message: 'must be root-relative (/path) or https://',
  }),
  kind: z.preprocess(empty, z.enum(['permanent', 'temporary']).default('permanent')),
  note: opt(z.string()),
});
export type Redirect = z.output<typeof redirectSchema>;
