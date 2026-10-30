# 05 CMS (Strapi 5) and SEO

The DM team edits words, images and SEO in Strapi. Code owns structure, components and motion. The home page lives at `HOME_PATH` (`/v4` while the variants are compared, `/` at launch; see 08-variants.md). Read 00-foundation and DESIGN.md first.

## Decisions
- **Strapi 5** (latest stable, TypeScript) lives in `cms/`, in this repo. It is its own package with its own lockfile, not a pnpm workspace. If Strapi's admin build fails under pnpm's strict linking, add `cms/.npmrc` with `node-linker=hoisted`.
- **Strapi hosting:** Vivasoft's own cloud, deployed by the user alone. Ship a `cms/Dockerfile` and a `cms/docker-compose.yml` (Strapi, Postgres 16). Media uses `@strapi/provider-upload-aws-s3` against any S3-compatible bucket, configured by env. Local dev uses SQLite. Everything is configured by env, documented in `cms/.env.example`.
- **Site hosting:** Cloudflare. The build stays static, with one on-demand route for preview. Use the current `@astrojs/cloudflare` adapter for Astro 7, and check its docs for whether it targets Workers or Pages. Redirects and headers go in `_redirects` and `_headers`.
- **Rebuild on publish:** Strapi server code, not a raw webhook. After a publish, unpublish or delete on any content type, or a media change, wait 60s for things to settle, then POST to `DEPLOY_HOOK_URL` (body and headers configurable by env). It must work with a Cloudflare deploy hook, or with GitHub `repository_dispatch` and an Actions build. Document whichever path you choose.
- **Build input:** Astro reads Strapi at build time with a read-only API token (`STRAPI_URL`, `STRAPI_TOKEN`). Strapi is the source of truth. A production build without Strapi fails with a clear message. Staging builds with no content source fall back to `fixtures/strapi/good` with a loud warning (noindex), so deploys pass while the CMS is not connected.
- **Environments:** `PUBLIC_SITE_ENV=production|staging`. Anything but production renders `noindex,nofollow` on every page, and robots.txt says `Disallow: /`.
- **Variant and lab routes:** `/` (showcase), `/v1`, `/v2`, `/v3` and `/lab*` are code pages, noindex and out of the sitemap; V4 is the only indexable page (see 08-variants.md).

## Lock-down: the DM team can't touch components or motion
These layers are enforced. Every agent must keep them true.
1. **No field for structure or style.** Schemas store only text, media, links, booleans and enums that name designed options (`tone: white | plate`). No colour, size, font, class, CSS, animation, raw HTML, iframe or embed fields. Ever.
2. **Fixed sections on hand-built pages.** Home (and later AI Platform and ROI) is a single type with fixed components, never a dynamic zone. Lists whose count drives layout or animation get `min = max` (the current count), or stay in code.
3. **Copy only, length-capped.** Every string has `maxLength`, set to about 1.3× the current home copy rounded up, so long copy can't break the fluid layout or the pinned scenes.
4. **Demo internals stay in code.** Chips, `results.phases`, evidence and trend data, drag help, status and aria strings, and everything in the labs' `copy.ts`. Rule: if changing it can break an animation or the product truth, it stays in code.
5. **Schemas are code.** Schema JSON lives in git. The Content-Type Builder only works in dev mode, so production can't change schemas.
6. **Role.** A "Marketing" admin role, created in Strapi `bootstrap` code so it's reproducible. It gets content-manager create, read, update, delete and publish on content types, and the media library. It gets no settings, plugins, roles, users, webhooks, API tokens or Content-Type Builder.
7. **Rich text** (Phase 1b onward) uses Strapi's `blocks` field. The renderer whitelists paragraph, h2, h3, lists, quote, link, bold, italic, code and image (alt required). It drops any other node.
8. **The build is the last guard.** See Validation. A failed build means no deploy, and the last good site stays live.
New sections or motion are a request to the developer. They become a new block in code, and only then appear in the CMS.

## Shared contracts (exact; both sides implement these)
**Component `seo.meta`** (on every page type):
- `metaTitle` (string, max 70; fallback `<title> | Novara` from site settings `titleTemplate`)
- `metaDescription` (text, required, 50–170)
- `focusKeyword` (string, max 60)
- `keywords` (string, max 255, comma-separated)
- `canonicalUrl` (string, optional, root-relative or absolute)
- `index` (bool, default true)
- `follow` (bool, default true)
- `ogTitle` (string, max 90)
- `ogDescription` (text, max 200)
- `ogImage` (media, images only)
- `structuredData` (json, optional; must be an object with `@type`)
- `breadcrumbLabel` (string, max 40)

`focusKeyword` and `keywords` feed the SEO panel only and are never rendered as meta.

**Single type `site-settings`:**
- `siteName` (default "Novara")
- `titleTemplate` (default `%s | Novara`)
- `defaultOgImage` (media, 1200×630 PNG; optional. Until one is uploaded, previews fall back to `/brand/og-default.png`, a 1200×630 PNG in the repo)
- `robotsTxt` (text, required; default = current `public/robots.txt`)

**Collection `redirect`:**
- `from` (string, required, unique, `^/[a-z0-9/_-]*$`)
- `to` (string, required, root-relative or `https://`)
- `kind` (enum `permanent | temporary`, default `permanent`; maps to 301/302)
- `note` (text)
- Draft & publish off.

All page types have Draft & publish on. Slugs are `uid` fields, lowercase and hyphenated.

## Astro side
- Data comes in through Content Layer loaders in `src/content.config.ts` that fetch Strapi, with zod schemas that mirror the contracts. A schema mismatch fails the build. Keep one small Strapi client in `src/lib/strapi.ts`.
- `Seo.astro` takes the `seo.meta` shape and site settings and renders:
  - title, description, canonical (self by default), robots;
  - OG and Twitter tags;
  - JSON-LD (keep the current Organization and SoftwareApplication, then add per-type schema and BreadcrumbList, then append `structuredData`).
  - FAQPage JSON-LD stays on the home page.
- Generated at build:
  - `robots.txt` from `site-settings` (staging overrides it);
  - the sitemap (`@astrojs/sitemap`, which drops every noindex page and uses `updatedAt` as `lastmod`);
  - `_redirects` from the `redirect` collection plus code redirects (`/privacy`, `/cookies`);
  - `404.astro` in the home page's style.
- Preview: an on-demand route `/preview/[...path]` (`prerender = false`). It needs a `PREVIEW_SECRET`, fetches `status=draft` with a separate preview token, and always sends noindex (meta and `X-Robots-Tag`). Wire it to Strapi 5's admin preview config so editors get a Preview button.

## Validation (build fails with a readable list)
- A zod mismatch, a required field missing, or a value over its length cap.
- Duplicate slugs within a type, or a path that collides across types or with code routes (`/`, `/v1`…`/v4`, `/lab*`, `/preview`, `/404`).
- Duplicate `metaTitle` or `metaDescription` across indexable pages.
- An image without alt text.
- Redirects:
  - a redirect whose `from` is a live page;
  - a loop;
  - an internal `to` that doesn't exist.
  - Chains are flattened automatically, with a warning.
- A canonical or internal link pointing to a missing internal path.
- In production, a `robotsTxt` that disallows `/` entirely.

## Phases
- **1a, foundation slice (now):**
  - **CMS:** the `cms/` app, contracts, `home`, the Marketing role, the rebuild trigger, preview config, Docker, and `docs/deploy.md` (the user's runbook for Vivasoft cloud and Cloudflare: env vars, tokens, the first admin, backups via a nightly `pg_dump`).
  - **Site:** Astro plumbing, the home page at `/` with its copy from Strapi, validation.
- **1b:**
  - blog (post, category, author; hub, category and post pages, Article JSON-LD);
  - legal (one `legal-page` collection, one URL each under `/legal/*`, shared tab layout);
  - the Book a Demo page;
  - redirects created automatically when a published slug changes (Document Service middleware);
  - an SEO side panel (Strapi admin `addEditViewSidePanel`) with a Google preview, a social preview, length meters, focus-keyword checks, missing alt and metadata, and a score.
- **2:** feature and solution templates, the block library from the home page components (About, Security), the HR glossary (DefinedTerm), Integrations, Pricing.
- **3:** AI Platform (hand-built), the ROI calculator (logic in code, labels and default assumptions in the CMS), and Reviews (only with real reviews).

## Product truth (unchanged)
Claim only features marked Available. No invented quotes, stats, certifications or prices. The seed carries the home copy as it is.
