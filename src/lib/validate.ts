/**
 * Build validation (spec "Validation"). Pure: takes loaded data and the registered pages and returns
 * one flat list of issues. The build integration fails on any error and prints the whole list.
 *
 * Later collections plug in through `pageProviders` in pages.ts: each provider returns `PageRecord`s
 * (path, slug, seo, images, links) and every check here picks them up. Schema, required-field and
 * length-cap checks run earlier, in site-data.ts, with the same zod schemas as the Content Layer.
 *
 * Check ids: slug-duplicate, path-collision, meta-title-duplicate, meta-description-duplicate,
 * image-alt, redirect-duplicate, redirect-live-page, redirect-loop, redirect-missing-target,
 * redirect-chain (warn), link-missing, canonical-missing, robots-disallow-all,
 * og-image-spec (warn).
 */
import { error, warn, type Issue } from './issues';
import { internalPath, normalizePath, type SiteEnv } from './paths';
import { mediaToImage, type PageRecord, type SiteData } from './pages';
import { codeRedirectRules, flatten, type RedirectRule } from './redirects';
import { isReserved, type CodeRoutes } from './routes-scan';
import { resolveTitle } from './seo';

export interface ValidateInput {
  data: SiteData;
  pages: PageRecord[];
  routes: CodeRoutes;
  siteEnv: SiteEnv;
  /** Run production-only checks even though this is a staging build (preflight). */
  asProduction?: boolean;
}

export interface ValidateResult {
  issues: Issue[];
  /** Final redirect rules (code + Strapi), chains flattened, loops dropped. Written to `_redirects`. */
  redirects: RedirectRule[];
}

const groupBy = <T>(items: T[], key: (t: T) => string): Map<string, T[]> => {
  const m = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    m.set(k, [...(m.get(k) ?? []), item]);
  }
  return m;
};

/** Does robots.txt disallow `/` for every crawler (`User-agent: *`) without an `Allow: /` to cancel it? */
export function robotsBlocksEverything(robotsTxt: string): boolean {
  let agents: string[] = [];
  let lastWasAgent = false;
  let disallowAll = false;
  let allowAll = false;
  let blocked = false;
  const flush = () => {
    if (agents.includes('*') && disallowAll && !allowAll) blocked = true;
    disallowAll = false;
    allowAll = false;
  };
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const key = m[1]!.toLowerCase();
    const value = m[2]!.trim();
    if (key === 'user-agent') {
      if (!lastWasAgent) {
        flush();
        agents = [];
      }
      agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key === 'disallow' && value === '/') disallowAll = true;
    if (key === 'allow' && value === '/') allowAll = true;
  }
  flush();
  return blocked;
}

export function validate(input: ValidateInput): ValidateResult {
  const { data, pages, routes } = input;
  const issues: Issue[] = [];
  const asProd = input.siteEnv === 'production' || input.asProduction === true;

  // ---- slugs and paths ----
  for (const [key, group] of groupBy(
    pages.filter((p) => p.slug),
    (p) => `${p.type}\u0000${p.slug}`,
  )) {
    if (group.length > 1) issues.push(error('slug-duplicate', group[0]!.type, `slug "${key.split('\u0000')[1]}" is used by ${group.length} entries: ${group.map((g) => g.where).join(', ')}. Slugs must be unique within a type.`));
  }
  for (const [p, group] of groupBy(pages, (r) => r.path)) {
    const sameSlug = group.every((g) => g.type === group[0]!.type && g.slug && g.slug === group[0]!.slug);
    if (group.length > 1 && !sameSlug) issues.push(error('path-collision', p, `${group.map((g) => g.where).join(' and ')} both resolve to ${p}.`));
  }
  const redirectFrom = new Set<string>([...codeRedirectRules.map((r) => r.from), ...data.redirects.map((r) => normalizePath(r.from))]);
  for (const page of pages) {
    if (page.route !== 'cms') continue;
    if (isReserved(page.path, routes)) issues.push(error('path-collision', page.path, `${page.where} resolves to ${page.path}, which a code route or public file already owns.`));
    else if (redirectFrom.has(page.path)) issues.push(error('path-collision', page.path, `${page.where} resolves to ${page.path}, which is also the source of a redirect.`));
  }

  // ---- meta title and description across indexable pages ----
  const indexable = pages.filter((p) => p.seo.index);
  for (const [, group] of groupBy(indexable, (p) => resolveTitle(p.seo, p.title, data.settings).trim().toLowerCase())) {
    if (group.length > 1) issues.push(error('meta-title-duplicate', group.map((g) => g.where).join(', '), `these indexable pages share the title "${resolveTitle(group[0]!.seo, group[0]!.title, data.settings)}". Give each its own metaTitle.`));
  }
  for (const [, group] of groupBy(indexable, (p) => p.seo.metaDescription.trim().toLowerCase())) {
    if (group.length > 1) issues.push(error('meta-description-duplicate', group.map((g) => g.where).join(', '), `these indexable pages share the same metaDescription. Give each its own.`));
  }

  // ---- images need alt text ----
  const images = [
    ...mediaToImage(data.settings.defaultOgImage, 'defaultOgImage').map((i) => ({ where: 'site-settings', ...i })),
    ...pages.flatMap((p) => [...p.images, ...mediaToImage(p.seo.ogImage, 'seo.ogImage')].map((i) => ({ where: p.where, ...i }))),
  ];
  for (const im of images) {
    if (!im.alt?.trim()) issues.push(error('image-alt', im.where, `image ${im.url} (${im.field}) has no alt text. Add it in the Strapi media library.`));
  }

  // ---- redirects ----
  const live = new Set<string>([...pages.map((p) => p.path), ...routes.exact]);
  const strapiRules: RedirectRule[] = data.redirects.map((r) => ({
    from: normalizePath(r.from),
    to: r.to,
    status: r.kind === 'temporary' ? 302 : 301,
    source: 'strapi',
    where: `redirect ${r.from}`,
  }));
  const seenFrom = new Map<string, RedirectRule>();
  for (const rule of [...codeRedirectRules, ...strapiRules]) {
    const prev = seenFrom.get(rule.from);
    if (prev) issues.push(error('redirect-duplicate', rule.where, `${rule.from} is already redirected by ${prev.where}. "from" must be unique.`));
    else seenFrom.set(rule.from, rule);
    if (rule.source === 'strapi' && (live.has(rule.from) || isReserved(rule.from, routes))) {
      issues.push(error('redirect-live-page', rule.where, `${rule.from} is a live page or file, so it can't also redirect. Unpublish or rename the page first.`));
    }
  }
  const flat = flatten([...codeRedirectRules, ...strapiRules]);
  for (const loop of flat.loops) issues.push(error('redirect-loop', `redirect ${loop[0]}`, `loop: ${[...loop, loop[0]].join(' -> ')}.`));
  for (const c of flat.chains) issues.push(warn('redirect-chain', c.rule.where, `chain ${[c.rule.from, ...c.hops].join(' -> ')} -> ${c.finalTo}; flattened to ${c.rule.from} -> ${c.finalTo}. Point it straight at the final page.`));
  for (const rule of flat.rules) {
    const p = internalPath(rule.to);
    if (p !== null && !live.has(p)) issues.push(error('redirect-missing-target', rule.where, `target ${rule.to} is not a page on this site.`));
  }

  // ---- canonical and internal links must resolve ----
  const exists = (p: string) => live.has(p) || redirectFrom.has(p);
  for (const page of pages) {
    const canon = page.seo.canonicalUrl ? internalPath(page.seo.canonicalUrl) : null;
    if (canon !== null && !exists(canon)) issues.push(error('canonical-missing', page.where, `canonicalUrl points to ${page.seo.canonicalUrl}, which is not a page on this site.`));
    for (const href of page.links) {
      const p = internalPath(href);
      if (p !== null && !exists(p)) issues.push(error('link-missing', page.where, `link to ${href} does not match any page on this site.`));
    }
  }

  // ---- robots and social image ----
  if (asProd && robotsBlocksEverything(data.settings.robotsTxt)) {
    issues.push(error('robots-disallow-all', 'site-settings.robotsTxt', 'production robots.txt disallows "/" for all crawlers, which would remove the site from search. Fix the text in Site settings.'));
  }
  const og = data.settings.defaultOgImage;
  // Unset is fine: previews fall back to the 1200x630 PNG in public/brand.
  if (og && (og.mime !== 'image/png' || og.width !== 1200 || og.height !== 630)) {
    issues.push(warn('og-image-spec', 'site-settings.defaultOgImage', `is ${og.mime} ${og.width ?? '?'}x${og.height ?? '?'}; the contract is a 1200x630 PNG.`));
  }

  return { issues, redirects: flat.rules };
}
