# 00 Foundation

## Stack (pnpm 10, Node 24)
astro 7.4.0 (static, `site: https://novara.my`) | tailwindcss + @tailwindcss/vite 4.3.3 | gsap 3.15.0 (ScrollTrigger/SplitText in main pkg) | lenis 1.3.27 | @astrojs/sitemap 3.7.4 | typescript 6.0.3 (pinned: `astro check` rejects TS 7) | @astrojs/check | @fontsource-variable/inter + urbanist 5.3.0. `cookie@^2` is a direct dep on purpose: a stray old CJS `cookie` in `C:\Users\thrasys\node_modules` otherwise breaks the build. No UI framework. TS = astro `strictest`.
Scripts: `pnpm dev | build | preview | check`. Never run a dev server unattended. SF Pro (`src/assets/fonts/sf-pro/`) is gitignored: never import or ship it.

## File map
- `astro.config.mjs`, `tsconfig.json`, `public/robots.txt`, `public/brand/` (logos)
- `src/styles/tokens.css`: Tailwind import, fonts, `@theme`. Imported by Base only.
- `src/layouts/Base.astro` props: `title, description, noindex, image`
- `src/components/seo/Seo.astro`; `components/{shared,v1,v2}/`
- `src/scripts/motion.ts`
- `src/pages/index.astro` (R&D chooser), `pages/v1/index.astro`, `pages/v2/index.astro`
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
- Always render through `Base`; every page passes unique `title` + `description`. Canonical is derived from `Astro.url` + site.
- `noindex` prop emits `robots noindex,nofollow`. Currently `/`, `/v1`, `/v2` all set it, and the sitemap filter excludes them (so the build warns "No pages found" and emits no sitemap; robots.txt already links `/sitemap-index.xml`). Drop `noindex` and the filter in `astro.config.mjs` at launch.
- JSON-LD in Seo: Organization (Vivasoft, maker) + SoftwareApplication "Novara" (BusinessApplication, no ratings/prices). OG/Twitter default image is `/brand/novara-full.svg`; swap for a 1200x630 PNG before launch (SVG is poorly supported by crawlers).
- Copy: sentence case, no em dashes, hiring-only positioning.
