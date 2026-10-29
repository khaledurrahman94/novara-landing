// Proves the build guard works: good fixtures build, bad fixtures fail with the expected checks,
// production refuses fixtures, production with no content source fails clearly, and staging with none falls back to the good fixtures.
// Run with `pnpm validate:fixtures`. It runs real `astro build`s, so it overwrites dist/.
import { spawnSync } from 'node:child_process';

const GOOD = 'fixtures/strapi/good';
const BAD = 'fixtures/strapi/bad';
const blank = { STRAPI_URL: '', STRAPI_TOKEN: '', STRAPI_FIXTURES: '', VALIDATE_AS: '' };

const runs = [
  {
    name: 'good fixtures build',
    env: { ...blank, STRAPI_FIXTURES: GOOD, PUBLIC_SITE_ENV: 'staging' },
    exit: 0,
    contains: ['[redirect-chain]', '[og-image-missing]', 'Wrote _redirects'],
    absent: ['content problem'],
  },
  {
    name: 'bad fixtures fail (production checks on)',
    env: { ...blank, STRAPI_FIXTURES: BAD, PUBLIC_SITE_ENV: 'staging', VALIDATE_AS: 'production' },
    exit: 'fail',
    contains: [
      '[schema]',
      '[redirect-loop]',
      '[redirect-live-page]',
      '[redirect-duplicate]',
      '[redirect-missing-target]',
      '[robots-disallow-all]',
      '[meta-title-duplicate]',
      '[meta-description-duplicate]',
      '[slug-duplicate]',
      '[path-collision]',
      '[image-alt]',
      '[canonical-missing]',
      '[link-missing]',
    ],
  },
  {
    name: 'production refuses fixtures',
    env: { ...blank, STRAPI_FIXTURES: GOOD, PUBLIC_SITE_ENV: 'production' },
    exit: 'fail',
    contains: ['Production builds never use fixtures'],
  },
  {
    name: 'production with no Strapi and no fixtures fails clearly',
    env: { ...blank, PUBLIC_SITE_ENV: 'production' },
    exit: 'fail',
    contains: ['No content source for the build'],
  },
  {
    name: 'staging with no content source falls back to the fixtures',
    env: { ...blank, PUBLIC_SITE_ENV: 'staging' },
    exit: 0,
    contains: ['BUILDING FROM LOCAL FIXTURES', 'Wrote _redirects'],
  },
  {
    name: 'STRAPI_URL without a token still fails',
    env: { ...blank, STRAPI_URL: 'https://example.invalid', PUBLIC_SITE_ENV: 'staging' },
    exit: 'fail',
    contains: ['STRAPI_TOKEN is missing'],
  },
];

const strip = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');
let failed = 0;
for (const run of runs) {
  const res = spawnSync('pnpm exec astro build', { shell: true, encoding: 'utf8', env: { ...process.env, ...run.env } });
  const out = strip(`${res.stdout ?? ''}\n${res.stderr ?? ''}`);
  const problems = [];
  if (run.exit === 0 && res.status !== 0) problems.push(`expected exit 0, got ${res.status}`);
  if (run.exit === 'fail' && res.status === 0) problems.push('expected the build to fail, but it passed');
  for (const needle of run.contains ?? []) if (!out.includes(needle)) problems.push(`output is missing "${needle}"`);
  for (const needle of run.absent ?? []) if (out.includes(needle)) problems.push(`output should not contain "${needle}"`);
  if (problems.length) {
    failed += 1;
    console.log(`FAIL  ${run.name}\n${problems.map((p) => `        - ${p}`).join('\n')}\n--- output ---\n${out.slice(-3000)}\n`);
  } else {
    console.log(`ok    ${run.name}`);
  }
}
if (failed) {
  console.log(`\n${failed} of ${runs.length} runs failed.`);
  process.exit(1);
}
console.log(`\nAll ${runs.length} runs behaved as expected.`);
