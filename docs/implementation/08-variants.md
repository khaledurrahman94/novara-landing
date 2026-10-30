# Design variants

The DM team compares four versions of the landing page. They are all in one build.

| Route | What | Indexable |
|---|---|---|
| `/` | Showcase: four cards with live previews (`src/pages/index.astro`) | no |
| `/v1` | V1, remaster of the agency design (pinned scenes) | no |
| `/v2` | V2, the standard page (in-flow motion) | no |
| `/v3` | V3, the bold interactive page that won, as it was before the DM feedback | no |
| `/v4` | V4, the home page with the DM feedback (`components/home/HomePage.astro`) | yes (production) |
| `/about`, `/contact`, `/pricing`, `/terms` | Company pages, part of V4 | yes (production) |

## Legacy snapshot

V1 to V3 are the code as of commit `b7b1ec0`, restored from git and not edited, except relative paths inside `src/pages/v1`, `v2` and `v3`. They live in `src/legacy/`, which mirrors the old `src/` layout so their imports stay as they were:

- `src/legacy/components/{v1,v2,v3,shared}`: old components, motion and CSS. `shared` is the old `components/shared` (the old `ui/*` without the percent rubric, `ScaleToFit`).
- `src/legacy/content/{v1,v2,v3}.ts`, `src/legacy/data/demo.ts`, `src/legacy/scripts/motion.ts` (still has the `novara:fit` listener).
- `src/legacy/styles/v1-fluid.css`: the `--v1-max` token V4 dropped from `src/styles/fluid.css`. Only `/v1` imports it.
- `src/pages/v1`, `v2`, `v3`: the three pages. `v3` renders the old `HomePage.astro` with `forceNoindex`.

Legacy CSS is imported only by the legacy pages. V4 classes are `home*`, legacy ones `v1`/`v2`/`v3`, so nothing collides. Legacy code is read-only history: do not fix or restyle it.

## Home path

`src/lib/home-path.ts` holds `HOME_PATH` (`/v4`), `HOME_DEMO_HREF` and `homeHref()`. The logo, the Nav home link, the About/Contact/Terms CTA, the 404 page, breadcrumbs, the canonical URL and the page registry (`homeProvider` in `src/lib/pages.ts`, which also feeds the live-link check) all use it. `home.ts` keeps `/` as its Home link (the CMS seed reads that file alone); `homeHref()` maps it at render time.

### Promoting V4 to `/`

1. Set `HOME_PATH = '/'` in `src/lib/home-path.ts`.
2. Move `src/pages/v4/index.astro` to `src/pages/index.astro` (fix the two import paths), replacing the showcase.
3. Delete the legacy (below), run `pnpm build` and `pnpm validate:fixtures`.

## Indexing

`/`, `/v1`, `/v2` and `/v3` render `noindex, nofollow` (Base `noindex` or `forceNoindex`), are not registered in `src/lib/pages.ts` so the sitemap skips them, and get `X-Robots-Tag: noindex` in `_headers`, like `/lab`. Outside production every page is noindex anyway. `robots.txt` still comes from Strapi.

## Deleting the legacy later

Remove `src/legacy/` and `src/pages/v1`, `v2`, `v3`; drop the `/v1`..`/v3` header rules in `src/integrations/novara-site.ts`; remove the showcase if V4 takes `/`. If old links should survive, add `/v1`, `/v2`, `/v3` to `codeRedirects` in `src/lib/redirects.ts` (target the home page) and update `astro.config.mjs` comments.

## V4 is interactive again

V4 was briefly animation-only (the DM team's request of 2026-10-29) and is interactive again since 2026-10-30. The animation-only variant lives on the `animated-only` branch. The interaction code is the one from the `interactive` branch, merged with the later changes (new Nav, Hero, Footer, AI interviewer avatar, the How it works and Audience snap, `live` link guard, no Roles tile). See `06-dm-feedback.md` and `03-home-page.md`.
