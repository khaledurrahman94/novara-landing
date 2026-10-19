/**
 * Reads every Strapi content type once and parses it with the same schemas as the Content Layer,
 * collecting all schema problems instead of stopping at the first. Node only (build time).
 */
import { strapiCollections } from './collections';
import { fromZod, type Issue } from './issues';
import { parseFixturePages, type SiteData } from './pages';
import type { Redirect, SiteSettings } from './schemas';
import type { BuildSource } from './strapi-build';

export interface LoadedSiteData {
  /** Present only when site-settings loaded and parsed; everything else degrades. */
  data: SiteData | undefined;
  issues: Issue[];
}

export async function loadSiteData(source: BuildSource): Promise<LoadedSiteData> {
  const issues: Issue[] = [];
  const parsed = new Map<string, unknown[]>();

  for (const def of strapiCollections) {
    const res = def.kind === 'single' ? await source.single(def.endpoint, def.params) : await source.collection(def.endpoint, def.params);
    const raw = def.kind === 'single' ? [res.data] : (res.data as unknown[]);
    const ok: unknown[] = [];
    for (const item of raw) {
      if (item == null) {
        issues.push({ level: 'error', check: 'schema', where: def.name, message: `no entry returned by ${source.describe()}. Publish it in Strapi first.` });
        continue;
      }
      const r = def.schema.safeParse(item);
      if (r.success) ok.push(r.data);
      else issues.push(...fromZod(def.label(item), r.error.issues));
    }
    parsed.set(def.name, ok);
  }

  let fixturePages: SiteData['fixturePages'] = [];
  if (source.mode === 'fixtures') {
    const fp = parseFixturePages(await source.extra('synthetic-pages.json'));
    fixturePages = fp.pages;
    issues.push(...fp.issues);
  }

  const settings = parsed.get('site-settings')?.[0] as SiteSettings | undefined;
  if (!settings) return { data: undefined, issues };
  return { data: { settings, redirects: (parsed.get('redirect') ?? []) as Redirect[], fixturePages }, issues };
}
