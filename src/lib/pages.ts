/**
 * Page providers: how each content type tells the build which pages exist. Validation uses these
 * to check paths, slugs, meta duplicates, images and links, and the sitemap uses them to know which
 * pages are indexable. A new collection (blog, legal, ...) adds one provider to `pageProviders`.
 */
import { z } from 'astro/zod';
import { company } from '../content/company';
import { home } from '../content/home';
import { legal } from '../content/legal';
import { HOME_PATH } from './home-path';
import { error, fromZod, type Issue } from './issues';
import { normalizePath } from './paths';
import { seoMetaSchema, type Media, type Redirect, type SeoMeta, type SiteSettings } from './schemas';

export interface ImageRef {
  url: string;
  alt: string | undefined;
  /** Which field the image is in, for error messages. */
  field: string;
}

export interface PageRecord {
  /** Content type: `home`, later `post`, `legal-page`... */
  type: string;
  /** Final URL path, normalised (no trailing slash). */
  path: string;
  /** The `uid` slug within the type, when the type has slugs. */
  slug?: string;
  /** `code`: an Astro page owns this path. `cms`: a template route renders it from Strapi. */
  route: 'code' | 'cms';
  /** Label for error messages, e.g. `post "hello-world"`. */
  where: string;
  /** The page's own title, for the `titleTemplate` fallback. */
  title?: string;
  seo: SeoMeta;
  updatedAt?: string;
  /** Images in the page body (cover, inline). `seo.ogImage` is collected automatically. */
  images: ImageRef[];
  /** Internal and external links in the page body. Internal ones must resolve. */
  links: string[];
}

/** Everything loaded from Strapi (or fixtures) before pages are collected. */
export interface SiteData {
  settings: SiteSettings;
  redirects: Redirect[];
  /** Fixtures only: stand-in pages so the checks can run before every content type exists. */
  fixturePages: PageRecord[];
}

export interface PageProvider {
  type: string;
  pages(data: SiteData): PageRecord[];
}

export const mediaToImage = (m: Media | undefined, field: string): ImageRef[] => (m ? [{ url: m.url, alt: m.alternativeText, field }] : []);

/**
 * TODO(home wiring): the home page (HOME_PATH) still takes its SEO from code. Replace `home.seo` with the `home` entry's
 * `seo` (its `updatedAt` becomes the sitemap lastmod) once the home content type is read.
 */
export function homeSeoMeta(): SeoMeta {
  return seoMetaSchema.parse({ metaTitle: home.seo.title, metaDescription: home.seo.description, breadcrumbLabel: 'Home' });
}

/** Every nav, hero and footer link marked `live` in home.ts. Listing them as page links makes the build check that each one resolves. */
const homeLiveLinks = (): string[] => {
  const all: readonly { href: string; live: boolean }[] = [
    ...home.nav.links,
    home.hero.pricing,
    ...home.footer.columns.flatMap((c): readonly { href: string; live: boolean }[] => c.links),
  ];
  return all.filter((l) => l.live).map((l) => l.href);
};

const homeProvider: PageProvider = {
  type: 'home',
  pages: () => [{ type: 'home', path: HOME_PATH, route: 'code', where: 'home', seo: homeSeoMeta(), images: [], links: homeLiveLinks() }],
};

/** Code-owned content pages (About, Contact, Pricing, Terms and policies): copy in src/content/company.ts and legal.ts. */
const companyProvider: PageProvider = {
  type: 'company',
  pages: () =>
    [
      { path: '/about', label: 'About', seo: company.about.seo },
      { path: '/contact', label: 'Contact', seo: company.contact.seo },
      { path: '/pricing', label: 'Pricing', seo: company.pricing.seo },
      { path: '/terms-policies', label: 'Terms and policies', seo: legal.seo },
    ].map((p) => ({
      type: 'company',
      path: p.path,
      route: 'code' as const,
      where: p.label,
      seo: seoMetaSchema.parse({ metaTitle: p.seo.title, metaDescription: p.seo.description, breadcrumbLabel: p.label }),
      images: [],
      links: [],
    })),
};

/** Stand-in pages from `synthetic-pages.json` in a fixtures dir. Exercises the checks; never reaches the site. */
const fixturePagesProvider: PageProvider = {
  type: 'fixture',
  pages: (data) => data.fixturePages,
};

export const pageProviders: PageProvider[] = [homeProvider, companyProvider, fixturePagesProvider];

// ---- fixture page parsing -------------------------------------------------------------------

const fixturePageSchema = z.object({
  type: z.string().min(1),
  slug: z.string().optional(),
  path: z.string().startsWith('/'),
  title: z.string().optional(),
  seo: seoMetaSchema,
  images: z.array(z.object({ url: z.string(), alt: z.string().nullish(), field: z.string().default('image') })).default([]),
  links: z.array(z.string()).default([]),
});

export function parseFixturePages(raw: unknown): { pages: PageRecord[]; issues: Issue[] } {
  if (raw === undefined) return { pages: [], issues: [] };
  if (!Array.isArray(raw)) return { pages: [], issues: [error('schema', 'synthetic-pages.json', 'must be a JSON array of pages')] };
  const pages: PageRecord[] = [];
  const issues: Issue[] = [];
  raw.forEach((item, i) => {
    const r = fixturePageSchema.safeParse(item);
    if (!r.success) {
      issues.push(...fromZod(`synthetic-pages.json[${i}]`, r.error.issues));
      return;
    }
    const p = r.data;
    pages.push({
      type: p.type,
      path: normalizePath(p.path),
      ...(p.slug ? { slug: p.slug } : {}),
      route: 'cms',
      where: `${p.type} "${p.slug ?? p.path}"`,
      ...(p.title ? { title: p.title } : {}),
      seo: p.seo,
      images: p.images.map((im) => ({ url: im.url, alt: im.alt ?? undefined, field: im.field })),
      links: p.links,
    });
  });
  return { pages, issues };
}
