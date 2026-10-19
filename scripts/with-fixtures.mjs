// Run a command with explicit fixtures: `node scripts/with-fixtures.mjs <good|bad|dir> -- <command...>`.
// `pnpm check` uses it so type generation has content without a Strapi. Staging only (production refuses fixtures).
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const [which, sep, ...cmd] = process.argv.slice(2);
if (!which || sep !== '--' || cmd.length === 0) {
  console.error('usage: node scripts/with-fixtures.mjs <good|bad|dir> -- <command...>');
  process.exit(2);
}
const dir = which === 'good' || which === 'bad' ? path.join('fixtures', 'strapi', which) : which;
const res = spawnSync(cmd.join(' '), {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, STRAPI_FIXTURES: dir, PUBLIC_SITE_ENV: 'staging' },
});
process.exit(res.status ?? 1);
