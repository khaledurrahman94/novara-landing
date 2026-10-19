import type { Core } from '@strapi/strapi';

type Doc = Record<string, unknown> | null;

/**
 * Content type uid to site path. A type missing here has no Preview button.
 * Add a line when a page type ships (for example the blog post: `/blog/${doc.slug}`).
 */
const PREVIEW_PATHS: Record<string, (doc: Doc) => string | null> = {
  'api::home.home': () => '/',
};

export const originOf = (url: string): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

/** `${SITE_URL}/preview/<path>?secret=${PREVIEW_SECRET}`. The home page maps to `/preview/`. */
export const previewUrl = (siteUrl: string, secret: string, path: string): string => {
  const rel = path === '/' ? '/' : `/${path.replace(/^\/+/, '')}`;
  return `${siteUrl.replace(/\/+$/, '')}/preview${rel}?secret=${encodeURIComponent(secret)}`;
};

export const previewHandler =
  (siteUrl: string, secret: string) =>
  async (uid: string, { documentId }: { documentId: string }): Promise<string | null> => {
    const toPath = PREVIEW_PATHS[uid];
    if (!toPath || !siteUrl || !secret) return null;
    const app = (globalThis as unknown as { strapi: Core.Strapi }).strapi;
    const doc = (await app.documents(uid as never).findOne({ documentId } as never)) as Doc;
    const path = toPath(doc);
    return path ? previewUrl(siteUrl, secret, path) : null;
  };
