/**
 * Idempotent seed: fills `site-settings` and `home` from the repo's own copy files, then publishes.
 *
 *   pnpm seed            create what is missing, leave anything that exists alone
 *   pnpm seed --force    overwrite the draft with the copy files and publish again
 *
 * Reads src/content/v2.ts, src/content/v3.ts and public/robots.txt from SEED_SRC_DIR
 * (default: the repo root; the Docker image ships them under /seed). No strings are duplicated here.
 * A seed run never triggers a deploy, whatever DEPLOY_HOOK_URL says.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileStrapi, createStrapi } from '@strapi/strapi';

const srcDir = path.resolve(process.env.SEED_SRC_DIR ?? path.join(__dirname, '..', '..'));
const force = process.argv.includes('--force');

type Copy = typeof import('../../src/content/v3').v3;

const loadCopy = async (): Promise<Copy> => {
  const file = path.join(srcDir, 'src', 'content', 'v3.ts');
  if (!fs.existsSync(file)) throw new Error(`Copy file not found: ${file}. Set SEED_SRC_DIR to a folder that holds src/content/v3.ts.`);
  return ((await import(pathToFileURL(file).href)) as { v3: Copy }).v3;
};

const anchorLabel = (v3: Copy, href: string): string => {
  const hit = v3.nav.anchors.find((a) => a.href === href);
  if (!hit) throw new Error(`v3.nav.anchors has no entry for ${href}`);
  return hit.label;
};

const tileKeys = ['pipeline', 'career', 'scheduling', 'roles', 'email', 'analytics'] as const;

/** The only place that maps copy-file paths to Strapi fields. docs/implementation/05a-home-fields.md mirrors it. */
const homeData = (v3: Copy) => ({
  seo: { metaTitle: v3.seo.title, metaDescription: v3.seo.description, index: true, follow: true },
  nav: {
    cta: v3.nav.cta,
    resultsLabel: anchorLabel(v3, '#results'),
    screeningLabel: anchorLabel(v3, '#screen'),
    interviewLabel: anchorLabel(v3, '#interview-lab'),
    howLabel: anchorLabel(v3, '#how'),
    faqLabel: anchorLabel(v3, '#faq'),
  },
  hero: { title: v3.hero.title, sub: v3.hero.sub, secondary: v3.hero.secondary },
  results: { title: v3.results.title, caption: v3.results.caption },
  decide: { title: v3.decide.title, sub: v3.decide.sub },
  how: { title: v3.how.title, steps: v3.how.steps.map((s) => ({ title: s.title, text: s.text })) },
  platform: {
    title: v3.platform.title,
    ...Object.fromEntries(tileKeys.map((k) => [k, { title: v3.platform.tiles[k].title, line: v3.platform.tiles[k].line }])),
  },
  faq: { title: v3.faq.title, items: v3.faq.items.map((i) => ({ question: i.q, answer: i.a })) },
  close: { title: v3.close.title, line: v3.close.line, cta: v3.form.submit },
  footer: {
    line: v3.footer.line,
    maker: v3.footer.maker,
    makerHref: v3.footer.makerHref,
    copyright: v3.footer.copyright,
    footnote: v3.footer.footnote,
  },
});

const siteSettingsData = () => {
  const robots = path.join(srcDir, 'public', 'robots.txt');
  if (!fs.existsSync(robots)) throw new Error(`robots.txt not found: ${robots}`);
  // defaultOgImage stays empty until the 1200x630 PNG exists.
  return { siteName: 'Novara', titleTemplate: '%s | Novara', robotsTxt: fs.readFileSync(robots, 'utf8') };
};

async function main() {
  // Seeding must never ping a deploy hook.
  process.env.DEPLOY_HOOK_URL = '';

  const v3 = await loadCopy();
  const context =
    process.env.NODE_ENV === 'production'
      ? { appDir: process.cwd(), distDir: path.join(process.cwd(), 'dist') }
      : await compileStrapi();
  const app = await createStrapi(context).load();
  app.log.level = 'warn';

  const upsert = async (uid: string, label: string, data: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = app.documents(uid as any) as any;
    const draft = await docs.findFirst({ status: 'draft' });
    const live = await docs.findFirst({ status: 'published' });

    if (draft && live && !force) {
      console.log(`${label}: already seeded, left alone`);
      return;
    }
    if (!draft) {
      await docs.create({ data, status: 'published' });
      console.log(`${label}: created and published`);
      return;
    }
    await docs.update({ documentId: draft.documentId, data });
    await docs.publish({ documentId: draft.documentId });
    console.log(`${label}: ${live ? 'overwritten' : 'completed'} and published`);
  };

  try {
    await upsert('api::site-settings.site-settings', 'site-settings', siteSettingsData());
    await upsert('api::home.home', 'home', homeData(v3));
  } finally {
    await app.destroy();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
