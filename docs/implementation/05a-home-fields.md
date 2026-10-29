# 05a Home fields: `home` object path to Strapi field

Wiring table for the Astro side. Strapi type `api::home.home` (single type, Draft & publish on). Read it at build time with `GET /api/home` (published) and, for preview, `GET /api/home?status=draft`. The seed (`cms/scripts/seed.ts`) fills it from `src/content/home.ts`, so the table below is also the seed's mapping.

## How to fetch
- `GET /api/home` returns every section populated, with no `populate` query (route middleware). A `populate` you send wins.
- Strapi 5 shape: `{ data: { documentId, publishedAt, seo, nav, hero, socialProof?, results, decide, how, platform, audience, faq, close, footer } }`. No `attributes` wrapper. Components carry an `id`; ignore it.
- Same token rules as everything else: `Authorization: Bearer <STRAPI_TOKEN>`. Only `find` exists over REST (no write routes).
- Mirror the caps below in zod (`.max(cap)`, `.min(1)`), and `how.steps` as exactly 9, `faq.items` as 3 to 10. A mismatch fails the build.
- Merge, do not replace: build the page copy as `{ ...codeCopy, hero: { ...codeCopy.hero, title, sub, secondary }, ... }`, so the keys marked "code" below keep coming from `home.ts`.

## In the CMS
Every field is required and non-empty. Strapi checks min and required rules on publish, not on draft save, so a draft can be incomplete but cannot go live that way. Caps are 1.3x the longest current string, rounded up, with a floor of 10 (3-char `FAQ` would otherwise cap at 4). Lists take the longest of their current items.

| `home` path | Strapi field | Type | Cap | Count |
|---|---|---|---|---|
| `seo.title` | `seo.metaTitle` | string | 70 (contract) | 1 |
| `seo.description` | `seo.metaDescription` | text | 50 to 170 (contract) | 1 |
| `nav.cta` | `nav.cta` | string | 19 | 1 |
| `nav.anchors` (`#results`) `.label` | `nav.resultsLabel` | string | 10 | 1 |
| `nav.anchors` (`#screen`) `.label` | `nav.screeningLabel` | string | 12 | 1 |
| `nav.anchors` (`#interview-lab`) `.label` | `nav.interviewLabel` | string | 12 | 1 |
| `nav.anchors` (`#how`) `.label` | `nav.howLabel` | string | 16 | 1 |
| `nav.anchors` (`#faq`) `.label` | `nav.faqLabel` | string | 10 | 1 |
| `hero.title` | `hero.title` | string | 39 | 1 |
| `hero.sub` | `hero.sub` | text | 189 | 1 |
| `hero.secondary` | `hero.secondary` | string | 26 | 1 |
| `socialProof.heading` | `socialProof.heading` | string | 60 | 0 or 1 (optional) |
| `socialProof.count` | `socialProof.count` | string, optional | 60 | 0 or 1 |
| `socialProof.logos[i]` `{ name, src, href? }` | `socialProof.logos[i]` (`home.logo`: `name` string 60, `src` string path or https URL, `href` optional https URL) | list | 1 to 12 | 0 to 12 |
| `results.title` | `results.title` | string | 45 | 1 |
| `results.caption` | `results.caption` | string | 77 | 1 |
| `decide.title` | `decide.title` | string | 60 | 1 |
| `decide.sub` | `decide.sub` | text | 63 | 1 |
| `how.title` | `how.title` | string | 16 | 1 |
| `how.steps[i].title` | `how.steps[i].title` | string | 45 | exactly 9 |
| `how.steps[i].text` | `how.steps[i].text` | text | 137 | exactly 9 |
| `platform.title` | `platform.title` | string | 46 | 1 |
| `platform.intro` | `platform.intro` | text | 230 | 1 |
| `platform.tiles.<k>.title` | `platform.<k>.title` | string | 28 | 6 named tiles |
| `platform.tiles.<k>.line` | `platform.<k>.line` | text | 93 | 6 named tiles |
| `audience.title` | `audience.title` | string | 70 | 1 |
| `audience.cta` | `audience.cta` | string | 19 | 1 |
| `audience.groups[i].label` | `audience.groups[i].label` | string | 40 | exactly 4 |
| `audience.groups[i].description` | `audience.groups[i].description` | text | 130 | exactly 4 |
| `audience.groups[i].built[j]` | `audience.groups[i].built[j].text` | string | 95 | 3 to 6 per group |
| `audience.groups[i].points[j]` | `audience.groups[i].points[j].text` | string | 95 | 3 to 5 per group |
| `faq.title` | `faq.title` | string | 34 | 1 |
| `faq.items[i].q` | `faq.items[i].question` | string | 62 | 3 to 10 (8 now) |
| `faq.items[i].a` | `faq.items[i].answer` | text | 285 | 3 to 10 (8 now) |
| `close.title` | `close.title` | string | 46 | 1 |
| `close.line` | `close.line` | text | 77 | 1 |
| `form.submit` | `close.cta` | string | 19 | 1 |
| `footer.line` | `footer.line` | text | 95 | 1 |
| `footer.maker` | `footer.maker` | string | 28 | 1 |
| `footer.makerHref` | `footer.makerHref` | string, `^https?://\S+$` | 200 (URL, not copy) | 1 |
| `footer.copyright` | `footer.copyright` | string | 17 | 1 |

Notes:
- `<k>` is one of `pipeline`, `career`, `scheduling`, `roles`, `email`, `analytics`. Tiles are named fields, not a list, so a tile's text cannot be paired with the wrong demo. Each is `{ title, line }`.
- `audience.groups` is exactly 4 and keeps its order; each group's icon is chosen in code by its `key` (`company`, `role`, `industry`, `agency`), which is not in the CMS. Group points and `built` lines may describe only features marked Available in `docs/novara-current-feature-overview.pdf`; no outcomes or stats.
- `how.steps` and `faq.items` keep the order the editor sets. The `how` section is pinned and animated, so its count is fixed at 9. Adding a step is a code change.
- `seo` is the shared `seo.meta` component (see 05-cms). The seed sets only `metaTitle`, `metaDescription`, `index: true`, `follow: true`; everything else is empty. `metaTitle` is the complete home title. Apply `titleTemplate` only when `metaTitle` is empty (the template would double the brand here).
- `nav.label`, `nav.home`, hrefs and the footer link list come from code. The five in-page `nav.anchors` labels stay seeded but are no longer rendered.
- Added by the DM feedback (06), all code-owned for now and not yet CMS fields: `nav.links[]` (label, href; the rendered header), `hero.pricing` and `hero.signIn` (label, href), `footer.rights`, `footer.followLabel`, `footer.social[]` (key, label, href; an empty href hides the icon), `footer.columns[]` (label, links[]), `footer.terms`, `footer.aiSummary` (label, prompt, assistants[] with key, label, url). `SIGN_IN_HREF` in `home.ts` is the sign-in URL (https://app.novara.com.my/sign-in). Promote these to Strapi fields (and `seed.ts`) when the DM team needs to edit them.

- `socialProof` is optional and ships empty. The component is not required in Strapi; once added it needs a heading and 1 to 12 logos. `SocialProof.astro` renders nothing when `logos` is empty, so leave the whole component unset until there are confirmed customers. The seed skips it while `home.ts` has no logos. Treat a missing `socialProof` in the API response as "no section".

## Stays in code (never in the CMS)
Rule 4 of 05-cms: if changing it can break an animation or the product truth, it stays in code.

| `home` path | Why |
|---|---|
| `nav.label`, `nav.home`, `nav.anchors[].href`, `footer.nav` | aria strings and link targets |
| `form.label`, `placeholder`, `error`, `sendError`, `success`, `sending`, `fallback` | validation, live-region and status strings |
| `hero.shotCaption`, `hero.chips.*` | screen-reader description of the mock, and demo chips |
| `results.figures[]` (key, label, note, callout, value, suffix) | numbers drive the funnel and are product truth |
| `results.phases`, `legend`, `hired`, `hintFine`, `hintTouch` | drive the dot animation |
| `decide.caption`, `from`, `to`, `stamp`, `dragHelp`, `drop`, `movedStatus`, `backStatus`, `evidenceTitle`, `evaluation.*`, `evidence.*`, `note` | demo internals, aria and status strings, product truth |
| `audience.tabsLabel`, `audience.builtFor`, `audience.groups[].key` | aria label, small label, icon and id key |
| `platform.copyEmbed`, `copied`, `copyFail`, `candidateName`, `candidateNamePlaceholder`, `restore`, `save`, `saved`, `hoverBar`, `trend`, `note` | demo internals and status strings |
| The two labs: `components/home/labs/screening/copy.ts`, `components/home/labs/interview/copy.ts` (titles and subs included) | rule 4 names the labs' `copy.ts` explicitly |
| Inline `figcaption` strings in `Platform.astro` | aria |
