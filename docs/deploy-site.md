# Deploy: site

The Strapi half (Vivasoft cloud, tokens, backups) is in `docs/deploy.md`. This file covers the site on Cloudflare.

## Site (Cloudflare)

**Target: Workers, not Pages.** `@astrojs/cloudflare` 14 (the one for Astro 7) only targets Workers and no longer supports Pages. The output is static: `dist/client/` holds every page, `_redirects` and `_headers`, and a small Worker in `dist/server/` answers only `/preview/*`. Use a Workers project with static assets, not a Pages project.

### Environment variables

| Name | Where | Value |
| --- | --- | --- |
| `PUBLIC_SITE_ENV` | build | `production` or `staging`. Anything else counts as staging. Both render `index, follow` (meta tag and `X-Robots-Tag`) and serve `robots.txt` and the sitemap the same way. |
| `STRAPI_URL` | build and runtime | Base URL of Strapi, no trailing slash. |
| `STRAPI_TOKEN` | build | Read-only API token: `find` on `site-settings`, `redirect` and each page type. |
| `PREVIEW_SECRET` | runtime | Long random string. Strapi's Preview button sends it as `?secret=`. |
| `STRAPI_PREVIEW_TOKEN` | runtime | A second token that can read drafts. Never reuse `STRAPI_TOKEN`. |
| `STRAPI_FIXTURES` | optional, staging | `fixtures/strapi/good`. Optional: a staging build with no Strapi variables uses it by default. Production refuses it. |
| `VALIDATE_AS` | optional | `production` runs the production-only checks on a staging build (preflight). |

"Build" variables go in the build environment (Workers Builds: Settings, Build, Variables and secrets, or the GitHub Actions secrets). "Runtime" ones go on the Worker: Settings, Variables and secrets, or `npx wrangler secret put <NAME>`. `wrangler.jsonc` sets `keep_vars`, so a deploy won't wipe them. `STRAPI_URL` is needed in both places.

With none of `STRAPI_URL`, `STRAPI_TOKEN` and `STRAPI_FIXTURES` set, a staging build (`PUBLIC_SITE_ENV` unset or not `production`) builds from `fixtures/strapi/good` and logs one prominent warning. `PUBLIC_SITE_ENV=production` with no Strapi fails the build on purpose, and so does `STRAPI_URL` without `STRAPI_TOKEN` (or the reverse). A failed build deploys nothing, so the last good site stays live.

### Build and deploy

```
pnpm install --frozen-lockfile
pnpm build          # astro build, runs every content check first
npx wrangler deploy # reads dist/server/wrangler.json through .wrangler/deploy/config.json
```

Node 24, pnpm 10. Locally, with no Strapi: `STRAPI_FIXTURES=fixtures/strapi/good pnpm build` (staging only). `pnpm check` does that for you. `pnpm validate:fixtures` proves that good fixtures build and bad ones fail.

### Rebuild on publish

Strapi calls `DEPLOY_HOOK_URL` 60 seconds after a publish, unpublish, delete or media change (`docs/deploy.md`). Pick one:

1. **Workers Builds (Cloudflare Git integration).** Connect the repo to the Worker, set build command `pnpm build`, deploy command `npx wrangler deploy`, and the build variables above. Create a deploy hook (Settings, Builds, Deploy hooks) and give its URL to Strapi as `DEPLOY_HOOK_URL`. Simplest, nothing to maintain.
2. **GitHub Actions.** A workflow on `repository_dispatch` (type `strapi-publish`) and on push to `main` runs the same three commands with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Strapi's `DEPLOY_HOOK_URL` is then `https://api.github.com/repos/<org>/<repo>/dispatches` with an `Authorization: Bearer <PAT>` header and body `{"event_type":"strapi-publish"}`.

Staging and production are two Workers (two deploys of the same repo) with different `PUBLIC_SITE_ENV`, `STRAPI_URL` and tokens. With Workers Builds, make two projects from the one repo. The Worker name comes from `wrangler.jsonc` (`novara-site`); override it for staging with `npx wrangler deploy --name novara-site-staging`.

### Custom domain

Add `novara.my` to the Worker: Settings, Domains and routes, Add, Custom domain (the zone must be on Cloudflare). Add `www.novara.my` as well and redirect it to the apex with a Cloudflare redirect rule. `site` in `astro.config.mjs` is `https://novara.my`; it drives canonicals, the sitemap and OG URLs, so change it there if the domain changes. Staging is `index, follow` like production; its canonicals still point at `https://novara.my`.

### What the build writes

- `robots.txt`: Strapi `site-settings.robotsTxt` on staging and production.
- `sitemap-index.xml`, `sitemap-0.xml`: registered, indexable pages only, production only. `lastmod` comes from the entry's `updatedAt`.
- `_redirects`: the `redirect` collection plus code redirects (`/privacy` and `/cookies` to their sections of `/terms-policies`), chains flattened. Cloudflare allows 2,000 static rules.
- `_headers`: `X-Robots-Tag: noindex, nofollow` on `/preview/*` (staging: every path), and the adapter's immutable cache for `/_astro/*`. `_headers` does not apply to Worker responses, so the preview route sets its own headers too.
- `404.html`.

### Preview route

Strapi's admin Preview button should open `https://<site>/preview/<public path>?secret=<PREVIEW_SECRET>` (the home page is `/preview/`). The route answers 404 if `PREVIEW_SECRET` is unset, 401 on a wrong secret, and always sends `noindex` as meta and `X-Robots-Tag`. It fetches drafts with `STRAPI_PREVIEW_TOKEN`. To run it locally put the runtime variables in `.dev.vars` (git-ignored) and use `pnpm build && pnpm preview`; note the adapter also loads `.dev.vars` into the build environment.

## Staging indexing (temporary)

> **Bad practice, remove in future.** Staging is currently `index, follow` with a crawlable `robots.txt` and a sitemap, because it was asked for. It should go back to `noindex, nofollow` and `Disallow: /` as soon as it is no longer needed.

Why it is a bad practice:

- **Duplicate content.** Staging serves the same pages as `novara.my`. Search engines may index both and split ranking between them, or rank the staging copy above the real site.
- **Unfinished work in search results.** Staging carries changes before review: drafts, broken pages, wrong prices or copy. Once indexed, they can show up in Google and stay cached long after they are fixed.
- **Wrong destination for users.** Visitors and leads who land on staging fill in forms and book demos against a non-production environment.
- **Hard to undo.** Removing indexed URLs later takes `noindex` plus time (or manual removal requests in Search Console); turning it off does not clear the index straight away.
- **Exposure.** An indexed staging host is easy to find, which helps anyone probing for test endpoints or unreleased features.
- Canonicals pointing at `https://novara.my` reduce the duplicate-content risk but are only a hint; they do not stop staging from being crawled or shown.

To remove it, restore the production-only gate in the places marked `TODO(remove)`:

- `src/lib/seo.ts`: `noindex`/`nofollow` true when `siteEnv !== 'production'`.
- `src/integrations/novara-site.ts`: `X-Robots-Tag: noindex, nofollow` on `/*` outside production.
- `src/pages/robots.txt.ts`: `Disallow: /` outside production.
- `src/lib/site-state.ts`: no sitemap outside production.

Then revert the staging wording in this file, `.env.example` and `src/env.d.ts`. If staging pages were already indexed, keep them reachable with `noindex` until they drop out (blocking them in robots.txt first stops crawlers from seeing the `noindex`), or request removal in Search Console.
