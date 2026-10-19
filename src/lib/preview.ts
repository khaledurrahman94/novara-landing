/**
 * Preview: the on-demand route /preview/[...path] looks the requested path up in a registry and
 * renders the matching resolver's draft. Later collections add a line to
 * src/preview/resolvers.ts. Platform neutral (runs in workerd).
 */
import { normalizePath } from './paths';
import type { StrapiConfig } from './strapi';

export interface PreviewContext {
  /** Normalised public path being previewed, e.g. `/blog/hello`. */
  path: string;
  /** `:name` segments from the matched pattern. */
  params: Record<string, string>;
  /** Strapi access for drafts: use `config.previewToken` with `{ draft: true }`, never the build token. */
  strapi: StrapiConfig;
}

export type PreviewResult =
  /** A resolver is registered but the draft isn't wired yet. */
  | { kind: 'pending'; message: string }
  /** Render this Astro component with these props. `forceNoindex: true` is added for you. */
  | { kind: 'page'; component: unknown; props: Record<string, unknown> }
  | { kind: 'not-found' };

export type PreviewResolver = (ctx: PreviewContext) => Promise<PreviewResult>;

export type PreviewRegistry = Record<string, PreviewResolver>;

/** `/blog/:slug` matches `/blog/hello` with `{ slug: 'hello' }`. Exact patterns are tried by the same code. */
export function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const want = normalizePath(pattern).split('/').filter(Boolean);
  const have = normalizePath(path).split('/').filter(Boolean);
  if (want.length !== have.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    const w = want[i]!;
    const h = have[i]!;
    if (w.startsWith(':')) params[w.slice(1)] = decodeURIComponent(h);
    else if (w !== h) return null;
  }
  return params;
}

export async function resolvePreview(registry: PreviewRegistry, path: string, strapi: StrapiConfig): Promise<PreviewResult> {
  for (const [pattern, resolve] of Object.entries(registry)) {
    const params = matchPattern(pattern, path);
    if (params) return resolve({ path, params, strapi });
  }
  return { kind: 'not-found' };
}

/** Compare secrets without bailing out at the first differing character. */
export function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
