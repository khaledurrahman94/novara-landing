import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';

/** robots.txt comes from Strapi's site-settings on staging and production alike (crawlable: index, follow). */
export const GET: APIRoute = async () => {
  // TODO(remove): letting staging be indexed is a bad practice, kept only on request. Restore the
  // production-only gate. See docs/deploy-site.md "Staging indexing (temporary)".
  const settings = (await getEntry('site-settings', 'site-settings'))?.data;
  const text = settings ? settings.robotsTxt : 'User-agent: *\nAllow: /';
  return new Response(`${text.trimEnd()}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
