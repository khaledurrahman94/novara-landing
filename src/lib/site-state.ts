/**
 * The prepared site, shared between the build integration (which fills it at `astro:config:done`)
 * and astro.config.mjs (whose sitemap filter reads it later). Same module instance, because both
 * are loaded by the Astro config loader. Node only.
 */
import { normalizePath } from './paths';
import type { SiteBuild } from './site-build';

let current: SiteBuild | undefined;

export const setSite = (site: SiteBuild): void => {
  current = site;
};
export const getSite = (): SiteBuild | undefined => current;

/** Sitemap policy: only registered, indexable pages, and none at all outside production. */
export function sitemapEntry(url: string): { indexable: boolean; lastmod?: string } {
  const site = current;
  if (!site || site.siteEnv !== 'production') return { indexable: false };
  const path = normalizePath(new URL(url).pathname);
  const page = site.pages.find((p) => p.path === path);
  if (!page || !page.seo.index) return { indexable: false };
  return { indexable: true, ...(page.updatedAt ? { lastmod: page.updatedAt } : {}) };
}
