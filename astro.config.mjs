import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import novaraSite from './src/integrations/novara-site.ts';
import { codeRedirects } from './src/lib/redirects.ts';
import { sitemapEntry } from './src/lib/site-state.ts';

// Static output. Cloudflare Workers adapter: the only on-demand route is /preview/*.
export default defineConfig({
  site: 'https://novara.my',
  output: 'static',
  // No astro:assets images and no sessions: skip the IMAGES and SESSION bindings so deploys need no extra resources.
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  // Code redirects (legacy /v1, /v2, /v3 -> /). Strapi redirects are added to _redirects by the novara-site integration.
  redirects: Object.fromEntries(codeRedirects.map((r) => [r.from, { status: r.status, destination: r.to }])),
  env: {
    // Runtime only, for the preview route. The build reads STRAPI_URL and STRAPI_TOKEN itself (src/lib/strapi-build.ts).
    schema: {
      STRAPI_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      STRAPI_PREVIEW_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      PREVIEW_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    novaraSite(),
    // Only registered, indexable pages, and none outside production. lastmod comes from the CMS updatedAt.
    sitemap({
      filter: (page) => sitemapEntry(page).indexable,
      serialize: (item) => {
        const { lastmod } = sitemapEntry(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
