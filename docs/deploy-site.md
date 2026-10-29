# Deploy: site

The Strapi half (Vivasoft cloud, tokens, backups) is in `docs/deploy.md`. This file covers the site on Cloudflare.

## Site (Cloudflare)

**Target: Workers, not Pages.** `@astrojs/cloudflare` 14 (the one for Astro 7) only targets Workers and no longer supports Pages. The output is static: `dist/client/` holds every page, `_redirects` and `_headers`, and a small Worker in `dist/server/` answers only `/preview/*`. Use a Workers project with static assets, not a Pages project.

### Environment variables

| Name | Where | Value |
| --- | --- | --- |
| `PUBLIC_SITE_ENV` | build | `production` or `staging`. Anything else counts as staging: every page is `noindex,nofollow` and `robots.txt` is `Disallow: /`. |
| `STRAPI_URL` | build and runtime | Base URL of Strapi, no trailing slash. |
| `STRAPI_TOKEN` | build | Read-only API token: `find` on `site-settings`, `redirect` and each page type. |
| `PREVIEW_SECRET` | runtime | Long random string. Strapi's Preview button sends it as `?secret=`. |
| `STRAPI_PREVIEW_TOKEN` | runtime | A second token that can read drafts. Never reuse `STRAPI_TOKEN`. |
| `STRAPI_FIXTURES` | optional, staging | `fixtures/strapi/good`. Optional: a staging build with no Strapi variables uses it by default. Production refuses it. |
| `VALIDATE_AS` | optional | `production` runs the production-only checks on a staging build (preflight). |

"Build" variables go in the build environment (Workers Builds: Settings, Build, Variables and secrets, or the GitHub Actions secrets). "Runtime" ones go on the Worker: Settings, Variables and secrets, or `npx wrangler secret put <NAME>`. `wrangler.jsonc` sets `keep_vars`, so a deploy won't wipe them. `STRAPI_URL` is needed in both places.

With none of `STRAPI_URL`, `STRAPI_TOKEN` and `STRAPI_FIXTURES` set, a staging build (`PUBLIC_SITE_ENV` unset or not `production`) builds from `fixtures/strapi/good` and logs one prominent warning; every page is `noindex`. `PUBLIC_SITE_ENV=production` with no Strapi fails the build on purpose, and so does `STRAPI_URL` without `STRAPI_TOKEN` (or the reverse). A failed build deploys nothing, so the last good site stays live.

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

Add `novara.my` to the Worker: Settings, Domains and routes, Add, Custom domain (the zone must be on Cloudflare). Add `www.novara.my` as well and redirect it to the apex with a Cloudflare redirect rule. `site` in `astro.config.mjs` is `https://novara.my`; it drives canonicals, the sitemap and OG URLs, so change it there if the domain changes. Keep staging on a `workers.dev` or `staging.` host: it is `noindex` and `Disallow: /` whatever the host.

### What the build writes

- `robots.txt`: Strapi `site-settings.robotsTxt` in production, `Disallow: /` otherwise.
- `sitemap-index.xml`, `sitemap-0.xml`: registered, indexable pages only, production only. `lastmod` comes from the entry's `updatedAt`.
- `_redirects`: the `redirect` collection plus code redirects (`/privacy` and `/cookies` to their sections of `/terms`), chains flattened. Cloudflare allows 2,000 static rules.
- `_headers`: `X-Robots-Tag: noindex, nofollow` on `/preview/*` (staging: every path), and the adapter's immutable cache for `/_astro/*`. `_headers` does not apply to Worker responses, so the preview route sets its own headers too.
- `404.html`.

### Preview route

Strapi's admin Preview button should open `https://<site>/preview/<public path>?secret=<PREVIEW_SECRET>` (the home page is `/preview/`). The route answers 404 if `PREVIEW_SECRET` is unset, 401 on a wrong secret, and always sends `noindex` as meta and `X-Robots-Tag`. It fetches drafts with `STRAPI_PREVIEW_TOKEN`. To run it locally put the runtime variables in `.dev.vars` (git-ignored) and use `pnpm build && pnpm preview`; note the adapter also loads `.dev.vars` into the build environment.
