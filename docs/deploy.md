# Deploy runbook

For one person deploying Novara to a company cloud. Two parts: the CMS (Strapi, on a VM with Docker) and the site (static Astro on Cloudflare). Contracts and rules: `docs/implementation/05-cms.md`.

## 1. CMS (Strapi)

You need: a Linux VM with Docker and the compose plugin, a DNS name for the CMS (for example `cms.novara.my`), TLS in front of it, an S3-compatible bucket for media, and this repo cloned on the VM.

### Secrets and env
```bash
cd cms
cp .env.example .env
# one secret:
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```
Fill `.env`. Every variable is explained in `cms/.env.example`; the ones you must set:

| Variable | Value |
|---|---|
| `APP_KEYS` | four secrets, comma-separated |
| `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY` | one secret each |
| `POSTGRES_PASSWORD` | one secret (`POSTGRES_DB` and `POSTGRES_USER` default to `strapi`) |
| `PUBLIC_URL`, `IS_PROXIED` | `https://cms.novara.my`, `true` |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | your bucket. Leave `S3_ACL` empty unless the bucket needs ACLs |
| `SITE_URL`, `PREVIEW_SECRET` | the site's origin, and one secret you also set on the site |
| `DEPLOY_HOOK_URL` (+ body, headers) | see "Rebuild on publish" |

Never commit `.env`. Keep a copy in your password manager: losing `ENCRYPTION_KEY` or the salts breaks stored tokens.

### Start
```bash
docker compose up -d --build        # Strapi on 127.0.0.1:1337, Postgres 16 on a volume
docker compose logs -f strapi       # wait for "Strapi started successfully"
```
Strapi listens on localhost only. Point a reverse proxy at it. Caddy is one line: `cms.novara.my { reverse_proxy 127.0.0.1:1337 }`. A cloud load balancer works too; keep `IS_PROXIED=true`.

### First admin
Open `https://cms.novara.my/admin`. The first registration becomes Super Admin. (Locked out later? `docker compose exec strapi node node_modules/@strapi/strapi/bin/strapi.js admin:reset-user-password --email you@company.com --password '<new>'`.) Then:
1. Settings, API Tokens: delete the two tokens Strapi created on first boot ("Read Only", "Full Access"). Their secrets were never shown.
2. Seed the content, once: `docker compose exec strapi npm run seed`. It fills Site settings and Home from the repo's copy files and publishes. It skips anything that exists. `npm run seed -- --force` overwrites the draft and publishes again.

### API tokens (Settings, API Tokens)
A token's secret is shown once. Copy it straight into the place that uses it.
- **`site-build`**: type Read-only, no expiry (or set one and diary the rotation). Goes in the site's build env as `STRAPI_TOKEN`.
- **`site-preview`**: type Custom, with Find and Find one on Home, Site settings and Redirect (add each new type later). Goes only in the preview route's secrets.

Strapi has no separate "read drafts" permission: any token that can find can add `?status=draft`. So the split is about where each token lives and what you can revoke, not what Strapi blocks. Keep the preview token out of the build env.

Check a token:
```bash
curl -s -H "Authorization: Bearer $TOKEN" https://cms.novara.my/api/home | head -c 300
curl -s -H "Authorization: Bearer $TOKEN" https://cms.novara.my/api/site-settings | head -c 300
```

### Invite the marketing user
Settings, Users, Invite new user, role **Marketing**. The role is created by code on every boot, with create, read, update, delete and publish on content, plus the media library, and nothing else (no settings, plugins, roles, users, webhooks, tokens or schema). Do not edit it in the admin: the next boot undoes it. Change `cms/src/lib/marketing-role.ts` instead. If no email provider is configured, Strapi shows an invitation link; send it yourself.

### Rebuild on publish
After a publish, unpublish, delete or media change, Strapi waits 60 seconds, then sends one POST to `DEPLOY_HOOK_URL`. Unset means off. Two ways:
- **Cloudflare deploy hook:** set only `DEPLOY_HOOK_URL` to the hook URL.
- **GitHub `repository_dispatch`:** `DEPLOY_HOOK_URL=https://api.github.com/repos/<owner>/<repo>/dispatches`, `DEPLOY_HOOK_BODY={"event_type":"strapi-publish"}`, `DEPLOY_HOOK_HEADERS={"Authorization":"Bearer <token with repo scope>","Accept":"application/vnd.github+json"}`. The Actions workflow builds and deploys.

Which one applies depends on how the site deploys (see Site, below). Check it: publish something, wait a minute, then `docker compose logs strapi | grep rebuild`. A failed hook is retried twice and then logged; trigger the deploy by hand.

### Backups
Nightly `pg_dump` on the VM (`/opt/novara/backup.sh`, mode 755):
```bash
#!/bin/sh
set -eu
cd /opt/novara/cms
docker compose exec -T db pg_dump -U strapi -d strapi -Fc > "/var/backups/novara/strapi-$(date +%F).dump"
find /var/backups/novara -name 'strapi-*.dump' -mtime +14 -delete
```
`0 2 * * * /opt/novara/backup.sh` in the crontab, and copy `/var/backups/novara` off the VM. Media lives in the bucket: turn on versioning there. Restore into an empty database: `docker compose exec -T db pg_restore -U strapi -d strapi --clean --if-exists < strapi-YYYY-MM-DD.dump`. Test a restore before you need one.

### Upgrades
1. Take a backup (above).
2. `cd cms && pnpm run upgrade:dry`, read it, then `pnpm run upgrade` (Strapi's codemods; plain `pnpm upgrade` is pnpm's own command, not this one). Run `pnpm build` and `pnpm seed` locally on SQLite first. Commit `package.json` and `pnpm-lock.yaml`.
3. On the VM: `git pull && cd cms && docker compose up -d --build`.
4. Postgres 16 minor updates: `docker compose pull db && docker compose up -d db`. A major version needs a dump and restore into a new volume.
5. Roll back: check out the previous commit, `docker compose up -d --build`, and restore the dump if the schema moved.

Schemas are code (`cms/src/api/*/content-types`, `cms/src/components`). The Content-Type Builder only works in local dev. Change a schema locally, commit it, deploy.

## 2. Site (Cloudflare)

TODO (site agent): not written yet. Cover:
- Which adapter target applies (Workers or Pages) and how the project is created.
- Build env: `STRAPI_URL`, `STRAPI_TOKEN` (the `site-build` token), `PUBLIC_SITE_ENV` (`production` or `staging`).
- Preview route env: the `site-preview` token and `PREVIEW_SECRET` (same value as in `cms/.env`).
- Creating the deploy hook (or the Actions workflow) and pasting it into `DEPLOY_HOOK_URL`.
- `_redirects` and `_headers`. The `/preview/*` response must be framable by the CMS admin origin (`frame-ancestors https://cms.novara.my`) and carry `X-Robots-Tag: noindex`.
- DNS and the custom domain.
