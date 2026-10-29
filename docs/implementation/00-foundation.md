# 00 Foundation

## Stack (pnpm 10, Node 24)
astro 7.4.0 (static + one on-demand route, `site: https://novara.my`) | @astrojs/cloudflare 14.4.0 (Workers) + wrangler 4 | tailwindcss + @tailwindcss/vite 4.3.3 | gsap 3.15.0 (ScrollTrigger/SplitText in main pkg) | lenis 1.3.27 | @astrojs/sitemap 3.7.4 | typescript 6.0.3 (pinned: `astro check` rejects TS 7) | @astrojs/check | @fontsource-variable/inter + urbanist 5.3.0. `cookie@^2` is a direct dep on purpose: a stray old CJS `cookie` in `C:\Users\thrasys\node_modules` otherwise breaks the build. No UI framework. TS = astro `strictest`.
Scripts: `pnpm dev | build | preview | check | validate:fixtures`. Builds need content: set `STRAPI_URL` + `STRAPI_TOKEN`, or `STRAPI_FIXTURES=fixtures/strapi/good` (staging only); see `.env.example`. `check` and `validate:fixtures` use fixtures themselves. Never run a dev server unattended. SF Pro (`src/assets/fonts/sf-pro/`) is gitignored: never import or ship it.

## File map
- `astro.config.mjs` (Cloudflare adapter, sitemap, code redirects), `wrangler.jsonc`, `tsconfig.json`, `.env.example`, `public/brand/` (logos). `robots.txt`, `_redirects`, `_headers` and `404.html` are generated.
- `src/styles/tokens.css`: Tailwind import, fonts, `@theme`. Imported by Base only.
- `src/layouts/Base.astro` props: `seo` (a `seo.meta` object, for CMS pages) or `title, description, noindex` (code pages), plus `pageTitle, schemas, breadcrumbs, forceNoindex, noCanonical, fluid`. It loads `site-settings` itself.
- `src/components/seo/Seo.astro` renders head tags from `seo.meta` + site settings; `src/lib/seo.ts` resolves them (also used by validation). `components/{shared,home}/`
- `src/scripts/motion.ts`
- `src/pages/`: `index.astro` (the home page, via `components/home/HomePage.astro`), `lab*` (component and lab test pages, noindex), `404.astro`, `robots.txt.ts`, `preview/[...path].astro` (the only on-demand route). The legacy URLs `/v1`, `/v2` and `/v3` are code redirects to `/` (`src/lib/redirects.ts`).
- `src/content.config.ts` + `src/lib/{collections,schemas,strapi-loader}.ts`: Content Layer loaders for `site-settings` and `redirect`; schemas mirror the contracts in 05-cms.md.
- `src/lib/strapi.ts` (REST client, populate helper) and `strapi-build.ts` (env files, fixtures; Node only).
- `src/lib/validate.ts` (build checks), `pages.ts` (page providers: add one per new collection), `site-build.ts`, `routes-scan.ts`. `src/integrations/novara-site.ts` runs them at `astro:config:done` and writes `_redirects`/`_headers`.
- `src/preview/resolvers.ts`: path to draft resolver registry for `/preview/*`.
- `fixtures/strapi/{good,bad}/`: JSON shaped like Strapi 5 REST responses; `scripts/` has `with-fixtures.mjs` and `validate-fixtures.mjs`.
- `src/assets/logo/` = source SVGs (do not import; use public/brand)

## Logos
Single convention: plain URLs from `public/brand/` (`/brand/novara-full.svg`, `novara-mark.svg`, `viva-logo.svg`, `viva-logo.png`). Use `<img src="/brand/...">`, or inline the SVG when it must animate/recolor. Not astro:assets.

## Tokens (`tokens.css`, Tailwind v4 `@theme`; default palette is wiped, only these exist)
- Brand colors: `bg, bg-secondary, bg-tertiary, blue-light, border-primary, border-secondary, primary, success, warning, text-placeholder, text-primary, text-secondary, text-tertiary` (+ `white, black, transparent, current`). Use as `bg-bg`, `text-text-primary`, `border-border-secondary`.
- DERIVED (UI states only, not brand): `gray-100/200/400/800/950` (Untitled UI), `primary-50..950` (500 = primary), `brand-from #8C75FB`, `brand-to #421DF8`.
- Gradient: `bg-brand-gradient` utility / `var(--gradient-brand)` (135deg). No gradient-text utility by design.
- Fonts: `font-display` / `font-sans` = Urbanist Variable (headlines, marketing); `font-ui` = Inter Variable (product-UI mockups only).
- Type: `text-display-2xl|xl|lg|md` (fluid clamp). Spacing: base 0.25rem, `--spacing-section`, `--spacing-gutter`. Radii: `rounded-sm|md|lg|xl|2xl|full`. Shadows: `shadow-xs|sm|md|lg|xl` (cool-gray tinted).
- Motion: `--duration-fast|base|slow|slower` = 150/250/400/700ms; `--ease-out-expo`, `--ease-out-quart`, `--ease-in-out` (use in GSAP via `CustomEase`/`"expo.out"`, or in CSS via `var()`).

## Motion convention (`src/scripts/motion.ts`)
Exports `onReady(cb)`, `prefersReducedMotion()`, `getLenis()`, plus re-exports `gsap`, `ScrollTrigger`. Pages opt in with `<script>import { onReady } from '../../scripts/motion'; ...</script>`.
- `onReady` waits for DOM, runs an idempotent bootstrap (register ScrollTrigger; Lenis lerp 0.1 on `gsap.ticker`, `ScrollTrigger.update` on scroll), then calls cb. cb may return a cleanup fn (run on `astro:before-swap`).
- A section registers inside `onReady`, ideally via `gsap.context(() => {...}, rootEl)`, and returns `() => ctx.revert()`.
- Reduced motion: no Lenis. Sections MUST check `prefersReducedMotion()` and set the end state directly (`gsap.set`, no ScrollTrigger scrub/pin), so content is fully visible and static.
- Initial hidden states: set via JS inside the cb (never CSS `opacity:0` alone), so no-JS/reduced-motion users see everything.

## SEO
- Always render through `Base`. CMS pages pass `seo` (the `seo.meta` shape); code pages pass `title` + `description`. Canonical is self by default (`Astro.url` + site), or `canonicalUrl`.
- Title is `metaTitle`, else `<pageTitle> | Novara` from the `titleTemplate` setting. OG and Twitter fall back to the meta title and description, then to `site-settings.defaultOgImage`, then to `/brand/novara-full.svg` (build warning until a 1200x630 PNG is uploaded).
- Indexing: `PUBLIC_SITE_ENV=production` is the only environment that renders `index`; anything else is `noindex,nofollow` on every page and `robots.txt` says `Disallow: /`. A page is also noindex if `seo.index` is false or the page passes `noindex`/`forceNoindex` (labs, 404, preview). The sitemap lists only registered indexable pages, in production.
- `/` takes its SEO from `home.seo` mapped into the `seo.meta` shape (`homeSeoMeta()` in `src/lib/pages.ts`) until home is read from Strapi.
- JSON-LD in Seo: Organization (Vivasoft, maker) + SoftwareApplication "Novara" (BusinessApplication, no ratings/prices), per-type schemas (`schemas` prop), BreadcrumbList, then `seo.structuredData`. The home FAQPage block stays in `HomePage.astro`.
- Copy: sentence case, no em dashes, hiring-only positioning.
