/**
 * Turns `seo.meta` + site settings into the values Seo.astro renders. Platform neutral, and shared
 * with build validation so "duplicate meta title" compares the title a visitor actually sees.
 */
import { SITE_ORIGIN, type SiteEnv } from './paths';
import type { Media, SeoMeta, SiteSettings } from './schemas';

export const FALLBACK_OG_IMAGE = '/brand/og-default.png';

export const DEFAULT_SETTINGS: Pick<SiteSettings, 'siteName' | 'titleTemplate'> = {
  siteName: 'Novara',
  titleTemplate: '%s | Novara',
};

/** `metaTitle`, or the page's own title run through the settings template. */
export function resolveTitle(meta: Pick<SeoMeta, 'metaTitle'>, pageTitle: string | undefined, settings: Pick<SiteSettings, 'siteName' | 'titleTemplate'>): string {
  if (meta.metaTitle) return meta.metaTitle;
  return settings.titleTemplate.replace('%s', pageTitle?.trim() || settings.siteName);
}

export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  /** `null` when the defaults apply (index, follow). */
  robots: string | null;
  indexable: boolean;
  og: { title: string; description: string; image: string; imageAlt: string | undefined; usedFallbackImage: boolean };
}

export interface ResolveInput {
  meta: SeoMeta;
  pageTitle?: string;
  settings: Pick<SiteSettings, 'siteName' | 'titleTemplate'> & { defaultOgImage?: Media | undefined };
  siteEnv: SiteEnv;
  /** Path of the page being rendered, used when no canonical is set. */
  pathname: string;
  /** Always noindex (preview, R&D routes), whatever `seo.meta` says. */
  forceNoindex?: boolean;
  site?: string;
}

export function resolveSeo(input: ResolveInput): ResolvedSeo {
  const { meta, settings, siteEnv, pathname } = input;
  const site = input.site ?? SITE_ORIGIN;
  const title = resolveTitle(meta, input.pageTitle, settings);
  const description = meta.metaDescription;
  const canonical = new URL(meta.canonicalUrl ?? pathname, site).href;
  // Anything but production is noindex,nofollow everywhere (spec "Environments").
  const noindex = siteEnv !== 'production' || input.forceNoindex === true || !meta.index;
  const nofollow = siteEnv !== 'production' || input.forceNoindex === true || !meta.follow;
  const robots = noindex || nofollow ? `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}` : null;
  const image = meta.ogImage ?? settings.defaultOgImage;
  return {
    title,
    description,
    canonical,
    robots,
    indexable: !noindex,
    og: {
      title: meta.ogTitle ?? title,
      description: meta.ogDescription ?? description,
      image: new URL(image?.url ?? FALLBACK_OG_IMAGE, site).href,
      imageAlt: image?.alternativeText,
      usedFallbackImage: !image,
    },
  };
}
