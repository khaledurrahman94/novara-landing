import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://novara.my',
  output: 'static',
  // R&D routes are noindex for now; keep them out of the sitemap.
  integrations: [sitemap({ filter: (p) => !/\/(v[12]\/)?$/.test(new URL(p).pathname) })],
  vite: { plugins: [tailwindcss()] },
});
