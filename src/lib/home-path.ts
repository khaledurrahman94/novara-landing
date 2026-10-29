/**
 * Where the home page (V4) is served. It is `/v4` while the design variants are compared, and `/` is the
 * variants showcase. Every link that means "the home page" uses this constant: the logo, the home demo anchor,
 * the canonical URL and the sitemap entry.
 * Promoting V4 to `/` at launch: set this to '/', move src/pages/v4/index.astro to src/pages/index.astro, and
 * delete the showcase and the legacy snapshot (docs/implementation/08-variants.md).
 */
export const HOME_PATH = '/v4';

/** `/v4#demo-close`: the home page's demo request form, reachable from the other pages. */
export const HOME_DEMO_HREF = `${HOME_PATH}#demo-close`;

/** Resolves a home-relative href: `/` stays the home page, `/#x` becomes `<HOME_PATH>#x`. Other paths are left as they are. */
export const homeHref = (href: string): string => (href === '/' ? HOME_PATH : href.startsWith('/#') ? `${HOME_PATH}${href.slice(1)}` : href);
