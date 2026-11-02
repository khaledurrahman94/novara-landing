/**
 * Build plumbing for the CMS-driven site:
 * - `astro:config:done`: load Strapi (or fixtures) and run every validation check. On a build, any
 *   error stops it with one readable list, before anything renders.
 * - `astro:build:done`: write `_redirects` (Strapi rules, chains flattened) and `_headers` next to the
 *   built pages. The Cloudflare adapter appends the code redirects and its asset cache rule afterwards.
 * robots.txt and 404.html are ordinary pages (src/pages), the sitemap is @astrojs/sitemap.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { AstroError } from 'astro/errors';
import { formatIssues } from '../lib/issues';
import { toRedirectsFile } from '../lib/redirects';
import { prepareSite } from '../lib/site-build';
import { StrapiError } from '../lib/strapi';
import { setSite, getSite } from '../lib/site-state';

/** A build failure the reader can act on: a title, the list, and a hint. */
const fail = (title: string, message: string, hint?: string) => new AstroError(`${title}\n\n${message}`, hint);

export function headersFile(siteEnv: 'production' | 'staging'): string {
  const rules = [
    '# Written by src/integrations/novara-site.ts. Do not edit; change the generator.',
    '/preview/*',
    '  X-Robots-Tag: noindex, nofollow',
    '  Cache-Control: no-store',
  ];
  if (siteEnv !== 'production') rules.push('', '/*', '  X-Robots-Tag: noindex, nofollow');
  return `${rules.join('\n')}\n`;
}

export default function novaraSite(): AstroIntegration {
  let command: 'dev' | 'build' | 'preview' | 'sync' = 'build';
  let clientDir = '';
  return {
    name: 'novara-site',
    hooks: {
      'astro:config:setup': ({ command: c }) => {
        command = c;
      },
      'astro:config:done': async ({ config, logger }) => {
        clientDir = fileURLToPath(config.build.client);
        // `astro preview` only serves what was already built: no content to load or check.
        if (command === 'preview') return;
        const site = await prepareSite(fileURLToPath(config.root)).catch((e: unknown) => {
          throw e instanceof StrapiError ? fail('Content source problem', e.message) : e;
        });
        setSite(site);
        if (site.fixturesFallback) {
          logger.warn('BUILDING FROM LOCAL FIXTURES: no STRAPI_URL/STRAPI_TOKEN set. Staging only, every page is noindex. Not for production.');
        }
        logger.info(`Content from ${site.describe} (${site.siteEnv})`);
        const errors = site.issues.filter((i) => i.level === 'error');
        if (site.issues.length) {
          const text = formatIssues(site.issues);
          if (errors.length && command === 'build') throw fail('Content validation failed', text, 'Fix the entries in Strapi (or the fixtures) and build again. Nothing was deployed.');
          (errors.length ? logger.error : logger.warn).call(logger, `\n${text}`);
        }
      },
      'astro:build:done': async ({ logger }) => {
        const site = getSite();
        if (!site) return;
        await mkdir(clientDir, { recursive: true });
        // Strapi rules only: the adapter appends the code redirects from astro.config `redirects`.
        const strapi = site.redirects.filter((r) => r.source === 'strapi');
        const redirectsPath = path.join(clientDir, '_redirects');
        const existing = await readFile(redirectsPath, 'utf8').catch(() => '');
        await writeFile(redirectsPath, `${toRedirectsFile(strapi)}${existing}`);
        // The adapter may already have written its _headers rule (immutable cache for /_astro/*): keep it below ours.
        const headersPath = path.join(clientDir, '_headers');
        const adapterHeaders = (await readFile(headersPath, 'utf8').catch(() => '')).trim();
        await writeFile(headersPath, `${headersFile(site.siteEnv)}${adapterHeaders ? `\n${adapterHeaders}\n` : ''}`);
        logger.info(`Wrote _redirects (${strapi.length} from Strapi) and _headers`);
      },
    },
  };
}
