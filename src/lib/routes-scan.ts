/**
 * What the site already owns by code: static routes from src/pages, dynamic route prefixes (`/preview`),
 * and files in public/. CMS paths must not collide with these, and redirects must not start from them.
 * Scanned from disk so a new code page is picked up without remembering to list it. Node only.
 */
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { normalizePath } from './paths';

export interface CodeRoutes {
  /** Exact static paths: pages, endpoints, public files, generated files. */
  exact: Set<string>;
  /** Path prefixes that belong to code (dynamic routes, public folders). `/preview` also covers `/preview/x`. */
  prefixes: Set<string>;
}

const PAGE_EXT = /\.(astro|md|mdx|html|ts|js)$/;

function walk(dir: string, visit: (rel: string[], isDir: boolean) => void, rel: string[] = []): void {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const full = path.join(dir, name);
    const isDir = statSync(full).isDirectory();
    visit([...rel, name], isDir);
    if (isDir) walk(full, visit, [...rel, name]);
  }
}

export function scanCodeRoutes(root: string): CodeRoutes {
  const exact = new Set<string>(['/sitemap-index.xml', '/sitemap-0.xml', '/_redirects', '/_headers']);
  const prefixes = new Set<string>(['/_astro']);

  walk(path.join(root, 'src', 'pages'), (rel, isDir) => {
    if (isDir || rel.some((s) => s.startsWith('_'))) return;
    const segs = rel.slice(0, -1);
    const file = rel[rel.length - 1]!.replace(PAGE_EXT, '');
    const all = file === 'index' ? segs : [...segs, file];
    const dyn = all.findIndex((s) => s.includes('['));
    if (dyn >= 0) {
      const prefix = normalizePath(`/${all.slice(0, dyn).join('/')}`);
      if (prefix !== '/') prefixes.add(prefix);
    }
    else exact.add(normalizePath(`/${all.join('/')}`));
  });

  walk(path.join(root, 'public'), (rel, isDir) => {
    if (isDir) {
      if (rel.length === 1) prefixes.add(`/${rel[0]}`);
      return;
    }
    exact.add(`/${rel.join('/')}`);
  });

  return { exact, prefixes };
}

export function isReserved(p: string, routes: CodeRoutes): boolean {
  if (routes.exact.has(p)) return true;
  for (const prefix of routes.prefixes) if (p === prefix || p.startsWith(`${prefix}/`)) return true;
  return false;
}
