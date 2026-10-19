import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { parseSiteEnv } from '../lib/paths';

/** robots.txt comes from Strapi's site-settings in production. Anything else says Disallow: / (spec "Environments"). */
export const GET: APIRoute = async () => {
  const production = parseSiteEnv(import.meta.env.PUBLIC_SITE_ENV) === 'production';
  const settings = (await getEntry('site-settings', 'site-settings'))?.data;
  const text = production && settings ? settings.robotsTxt : 'User-agent: *\nDisallow: /';
  return new Response(`${text.trimEnd()}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
