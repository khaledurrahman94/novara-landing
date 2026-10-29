/** Path helpers shared by build-time code and components. No Node imports: this runs in workerd too. */

export const SITE_ORIGIN = 'https://novara.my';

/** Drop query and hash, force a leading slash, drop a trailing slash (except the root). */
export function normalizePath(input: string): string {
  const cut = input.split('#')[0]!.split('?')[0]!;
  let p = cut.startsWith('/') ? cut : `/${cut}`;
  if (p.length > 1 && p.endsWith('/')) p = p.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

/** True when `href` is a root-relative path or an absolute URL on the site origin. Mail, tel, hash-only and other origins are not internal. */
export function internalPath(href: string, origin: string = SITE_ORIGIN): string | null {
  const v = href.trim();
  if (v === '' || v.startsWith('#')) return null;
  if (v.startsWith('/') && !v.startsWith('//')) return normalizePath(v);
  try {
    const u = new URL(v);
    if (u.origin === origin) return normalizePath(u.pathname);
  } catch {
    // not an absolute URL
  }
  return null;
}

export type SiteEnv = 'production' | 'staging';

/** Anything other than the exact value `production` counts as staging, so a missing variable is safe. */
export function parseSiteEnv(value: string | undefined): SiteEnv {
  return value?.trim() === 'production' ? 'production' : 'staging';
}
