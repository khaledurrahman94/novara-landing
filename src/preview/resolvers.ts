/**
 * Path -> draft resolver registry for /preview/*. One entry per previewable page type.
 * A resolver fetches the draft with the preview token and returns the component to render:
 *
 *   const res = await fetchSingle(ctx.strapi, 'homes', populate({...}), { draft: true, token: ctx.strapi.previewToken });
 *   return { kind: 'page', component: HomePage, props: { seo: parsed.seo } };
 *
 * Patterns use `:param` segments, e.g. '/blog/:slug'. Paths match the public URL.
 */
import type { PreviewRegistry } from '../lib/preview';

export const previewResolvers: PreviewRegistry = {
  // TODO(home wiring): fetch the draft `home` entry and render components/home/HomePage.astro with it.
  // Until home is read from Strapi there is no draft to show, so this says so.
  '/': async () => ({ kind: 'pending', message: 'Home preview pending' }),
};
