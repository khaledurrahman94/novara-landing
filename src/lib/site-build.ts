/**
 * Build-time orchestration: load Strapi (or fixtures), collect pages from the providers, run the
 * checks. One call, one result. Node only. The Astro integration calls this once per build.
 */
import { formatIssues, type Issue } from './issues';
import { pageProviders, type PageRecord, type SiteData } from './pages';
import { parseSiteEnv, type SiteEnv } from './paths';
import type { RedirectRule } from './redirects';
import { scanCodeRoutes } from './routes-scan';
import { loadSiteData } from './site-data';
import { buildConfig, getSource } from './strapi-build';
import { validate } from './validate';

export interface SiteBuild {
  siteEnv: SiteEnv;
  mode: 'live' | 'fixtures';
  /** True when no source was configured and the local fixtures were used (non-production only). */
  fixturesFallback: boolean;
  describe: string;
  data: SiteData | undefined;
  pages: PageRecord[];
  /** Final redirects, flattened. */
  redirects: RedirectRule[];
  issues: Issue[];
}

export async function prepareSite(root: string): Promise<SiteBuild> {
  const config = buildConfig(root);
  const source = getSource(config);
  const loaded = await loadSiteData(source);
  const siteEnv = parseSiteEnv(config.siteEnv);
  const base = { siteEnv, mode: source.mode, describe: source.describe(), fixturesFallback: config.fixturesFallback === true, data: loaded.data };
  if (!loaded.data) return { ...base, pages: [], redirects: [], issues: loaded.issues };

  const pages = pageProviders.flatMap((p) => p.pages(loaded.data!));
  const result = validate({
    data: loaded.data,
    pages,
    routes: scanCodeRoutes(root),
    siteEnv,
    asProduction: process.env['VALIDATE_AS']?.trim() === 'production',
  });
  return { ...base, pages, redirects: result.redirects, issues: [...loaded.issues, ...result.issues] };
}

export { formatIssues };
