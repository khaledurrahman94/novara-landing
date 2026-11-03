# Launch checklist

Work through this before the site goes live. The home page is served at `/`. Struck items are done in code.

- [ ] **Demo form endpoint.** Pass `action` to the home page's DemoForm, using HubSpot, Formspree, the CRM or whatever marketing uses. Without it, production builds warn and send nothing.
- [x] ~~**Indexing.** Remove `noindex` from the winning page and the sitemap filter.~~ Done in code: `PUBLIC_SITE_ENV=production` renders `index` on `/`, and the sitemap and `robots.txt` are generated. Left to do: set `PUBLIC_SITE_ENV=production` on the production deploy only (see `docs/deploy-site.md`). Production needs a real content source (Strapi, or the CMS source once connected): setting `PUBLIC_SITE_ENV=production` without one fails the build on purpose, it never falls back to fixtures.
- [ ] **Social preview.** Upload a 1200×630 PNG as `defaultOgImage` in Strapi Site settings (with alt text). Optional: until then previews use the repo's `/brand/og-default.png` (1200×630 PNG). Upload a branded one to replace it.
- [ ] **AI interviewer media.** Replace InterviewFrame's neutral stand-in with a real still or clip of Novara's avatar.
- [ ] **Domain.** Confirm `site` in `astro.config.mjs` (currently `https://novara.my`) and add the custom domain to the Worker (`docs/deploy-site.md`). It drives the canonical URLs, sitemap and OG links.
- [ ] **Log in link.** Add one if existing customers need it from the landing page; it's left out because the URL is unknown.
- [ ] **PM confirmations.** The page avoids these claims, so keep it that way until they're confirmed: automatic stage moves, score thresholds, offer letters.
- ~~**Promote V4 to `/`.**~~ Done: the home page is `src/pages/index.astro`, the earlier variants are removed. Re-run `pnpm build` and `pnpm validate:fixtures`.
