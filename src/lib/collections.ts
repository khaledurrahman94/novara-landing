/**
 * The Strapi content types the site reads. One entry per type: the Content Layer loader and the
 * build validation both use it, so they can't drift. Adding a collection later = add an entry here,
 * register it in src/content.config.ts, and add a page provider in src/lib/pages.ts.
 */
import type { z } from 'astro/zod';
import { populate, type QueryValue } from './strapi';
import { redirectSchema, siteSettingsSchema } from './schemas';

export interface StrapiCollection {
  /** Content Layer collection name, and the Strapi singular API id. */
  name: string;
  kind: 'single' | 'collection';
  /** REST path segment after /api/, and the fixture file name (`<endpoint>.json`). */
  endpoint: string;
  params: Record<string, QueryValue>;
  schema: z.ZodType;
  /** Stable entry id and a label for error messages. */
  entryId(raw: unknown): string;
  label(raw: unknown): string;
}

const field = (raw: unknown, key: string): string | undefined => {
  const v = (raw as Record<string, unknown> | null)?.[key];
  return typeof v === 'string' || typeof v === 'number' ? String(v) : undefined;
};

export const siteSettingsCollection: StrapiCollection = {
  name: 'site-settings',
  kind: 'single',
  endpoint: 'site-settings',
  params: populate({ defaultOgImage: true }),
  schema: siteSettingsSchema,
  entryId: () => 'site-settings',
  label: () => 'site-settings',
};

export const redirectCollection: StrapiCollection = {
  name: 'redirect',
  kind: 'collection',
  endpoint: 'redirects',
  params: {},
  schema: redirectSchema,
  entryId: (raw) => field(raw, 'documentId') ?? field(raw, 'id') ?? field(raw, 'from') ?? 'unknown',
  label: (raw) => `redirect ${field(raw, 'from') ?? field(raw, 'id') ?? '?'}`,
};

export const strapiCollections: StrapiCollection[] = [siteSettingsCollection, redirectCollection];
