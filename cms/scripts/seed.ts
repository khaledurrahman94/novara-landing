/**
 * Idempotent seed: fills `site-settings` and `home` from the repo's own copy files, then publishes.
 *
 *   pnpm seed            create what is missing, leave anything that exists alone
 *   pnpm seed --force    overwrite the draft with the copy files and publish again
 *
 * Reads src/content/home.ts and public/robots.txt from SEED_SRC_DIR
 * (default: the repo root; the Docker image ships them under /seed). No strings are duplicated here.
 * A seed run never triggers a deploy, whatever DEPLOY_HOOK_URL says.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileStrapi, createStrapi } from '@strapi/strapi';

const srcDir = path.resolve(process.env.SEED_SRC_DIR ?? path.join(__dirname, '..', '..'));
const force = process.argv.includes('--force');

type Copy = typeof import('../../src/content/home').home;

const loadCopy = async (): Promise<Copy> => {
  const file = path.join(srcDir, 'src', 'content', 'home.ts');
  if (!fs.existsSync(file)) throw new Error(`Copy file not found: ${file}. Set SEED_SRC_DIR to a folder that holds src/content/home.ts.`);
  return ((await import(pathToFileURL(file).href)) as { home: Copy }).home;
};

const anchorLabel = (copy: Copy, href: string): string => {
  const hit = copy.nav.anchors.find((a) => a.href === href);
  if (!hit) throw new Error(`copy.nav.anchors has no entry for ${href}`);
  return hit.label;
};

const tileKeys = [
  'dashboard',
  'jobs',
  'candidate',
  'pipeline',
  'scheduling',
  'interviews',
  'career',
  'analytics',
] as const;

/** The only place that maps copy-file paths to Strapi fields. docs/implementation/05a-home-fields.md mirrors it. */
const homeData = (copy: Copy) => ({
  seo: { metaTitle: copy.seo.title, metaDescription: copy.seo.description, index: true, follow: true },
  nav: {
    cta: copy.nav.cta,
    resultsLabel: anchorLabel(copy, '#results'),
    screeningLabel: anchorLabel(copy, '#screen'),
    interviewLabel: anchorLabel(copy, '#interview-lab'),
    howLabel: anchorLabel(copy, '#how'),
    faqLabel: anchorLabel(copy, '#faq'),
  },
  hero: { title: copy.hero.title, sub: copy.hero.sub },
  // Optional: only seeded when real logos exist, so an empty slot stays empty in the CMS too.
  ...(copy.socialProof.logos.length > 0
    ? {
        socialProof: {
          heading: copy.socialProof.heading,
          ...(copy.socialProof.count ? { count: copy.socialProof.count } : {}),
          logos: copy.socialProof.logos.map((l) => ({ name: l.name, src: l.src, ...(l.href ? { href: l.href } : {}) })),
        },
      }
    : {}),
  results: { title: copy.results.title, caption: copy.results.caption },
  decide: { title: copy.decide.title, sub: copy.decide.sub },
  how: { title: copy.how.title, steps: copy.how.steps.map((s) => ({ title: s.title, text: s.text })) },
  platform: {
    title: copy.platform.title,
    intro: copy.platform.intro,
    ...Object.fromEntries(tileKeys.map((k) => [k, { title: copy.platform.tiles[k].title, line: copy.platform.tiles[k].line }])),
  },
  audience: {
    title: copy.audience.title,
    cta: copy.audience.cta,
    groups: copy.audience.groups.map((g) => ({
      label: g.label,
      description: g.description,
      built: g.built.map((text) => ({ text })),
      points: g.points.map((text) => ({ text })),
    })),
  },
  faq: { title: copy.faq.title, items: copy.faq.items.map((i) => ({ question: i.q, answer: i.a })) },
  close: { title: copy.close.title, line: copy.close.line, cta: copy.form.submit },
  footer: {
    line: copy.footer.line,
    maker: copy.footer.maker,
    makerHref: copy.footer.makerHref,
    copyright: copy.footer.copyright,
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

  const copy = await loadCopy();
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
    await upsert('api::home.home', 'home', homeData(copy));
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
