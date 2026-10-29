/** Redirect rules: the code-owned ones, and flattening of chains. Platform neutral. */
import { internalPath, normalizePath } from './paths';

export interface RedirectRule {
  /** Normalised path (no trailing slash). */
  from: string;
  /** Root-relative path (may carry ?query or #hash) or an absolute https URL. */
  to: string;
  status: 301 | 302;
  source: 'code' | 'strapi';
  /** Label for error messages. */
  where: string;
}

/**
 * Redirects owned by code. Astro serves them in dev (astro.config.mjs `redirects`) and the Cloudflare
 * adapter writes them into `_redirects`. They take part in loop, chain and live-page checks.
 */
export const codeRedirects: ReadonlyArray<Pick<RedirectRule, 'from' | 'to' | 'status'>> = [
  // Common legal URLs land on their section of the combined Terms and Policy page.
  { from: '/privacy', to: '/terms#privacy-policy', status: 301 },
  { from: '/cookies', to: '/terms#cookie-policy', status: 301 },
];

export const codeRedirectRules: RedirectRule[] = codeRedirects.map((r) => ({ ...r, source: 'code', where: `code redirect ${r.from}` }));

export interface Chain {
  rule: RedirectRule;
  /** Every internal hop after the first target, in order. */
  hops: string[];
  finalTo: string;
}

export interface Flattened {
  /** Rules with their final target, in input order. Loops are left out. */
  rules: RedirectRule[];
  chains: Chain[];
  /** Each loop as the list of paths that make it up, reported once. */
  loops: string[][];
}

/**
 * Follows every rule to its final target. A chain (`/a -> /b -> /c`) becomes `/a -> /c`; if any hop is
 * temporary the whole rule is temporary. A rule that ends up back where it started is a loop and is dropped.
 */
export function flatten(rules: RedirectRule[]): Flattened {
  const byFrom = new Map<string, RedirectRule>();
  for (const r of rules) if (!byFrom.has(r.from)) byFrom.set(r.from, r);

  const out: RedirectRule[] = [];
  const chains: Chain[] = [];
  const loops: string[][] = [];
  const seenLoops = new Set<string>();

  for (const rule of rules) {
    const visited = [rule.from];
    const hops: string[] = [];
    let to = rule.to;
    let status = rule.status;
    let looped = false;
    for (;;) {
      const p = internalPath(to);
      const next = p === null ? undefined : byFrom.get(p);
      if (!next) break;
      if (visited.includes(next.from)) {
        const cycle = visited.slice(visited.indexOf(next.from));
        const key = [...cycle].sort().join('>');
        if (!seenLoops.has(key)) {
          seenLoops.add(key);
          loops.push(cycle);
        }
        looped = true;
        break;
      }
      visited.push(next.from);
      hops.push(next.from);
      to = next.to;
      if (next.status === 302) status = 302;
    }
    if (looped) continue;
    const flat = { ...rule, to, status };
    out.push(flat);
    if (hops.length) chains.push({ rule, hops, finalTo: to });
  }
  return { rules: out, chains, loops };
}

/** `_redirects` text for Cloudflare: `from to status` per line, plus a trailing-slash twin so `/old/` redirects too. */
export function toRedirectsFile(rules: RedirectRule[]): string {
  const lines: string[] = [];
  for (const r of rules) {
    lines.push(`${r.from} ${r.to} ${r.status}`);
    if (r.from !== '/') lines.push(`${normalizePath(r.from)}/ ${r.to} ${r.status}`);
  }
  return lines.length ? `${lines.join('\n')}\n` : '';
}
