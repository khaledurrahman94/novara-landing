# Novara CMS

Strapi 5 (TypeScript) for the Novara marketing site. Editors change words, images and SEO here. Structure and motion live in the Astro site. Rules and contracts: `docs/implementation/05-cms.md`. Home fields: `docs/implementation/05a-home-fields.md`. Deploying: `docs/deploy.md`.

## Run locally (SQLite, no Docker)

```bash
cd cms
cp .env.example .env     # then fill the five secrets; see the comment at the top of the file
pnpm install
pnpm seed                # fills site-settings and home from ../src/content/home.ts, then publishes. Safe to repeat.
pnpm dev                 # http://localhost:1337/admin (first run asks for the first admin)
```

`pnpm build` compiles the TypeScript and the admin panel. `pnpm start` runs the build. `pnpm seed --force` overwrites the draft with the copy files and publishes again.

Schemas are code (`src/api/*/content-types`, `src/components`). The Content-Type Builder only works in `pnpm dev`; commit what it writes.

## What lives where
- `src/api/{home,site-settings,redirect}`: content types. Read-only over REST.
- `src/components/{seo,home}`: `seo.meta` and the fixed home sections.
- `src/lib/rebuild.ts`: debounced deploy hook on publish, unpublish, delete and media changes.
- `src/lib/marketing-role.ts`: the Marketing admin role, rebuilt on every boot.
- `src/lib/preview.ts`: admin Preview button URL.
- `scripts/seed.ts`: the idempotent seed.
