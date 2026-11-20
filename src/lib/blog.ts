/**
 * Blog model and the pure helpers the blog hub uses on the server (first render) and in the browser
 * (filter, sort, paginate). No DOM here, so every rule lives in one place and can be unit-tested.
 */

export interface BlogAuthor {
  name: string;
  /** Two letters for the avatar until real photos exist. */
  initials: string;
  role?: string;
}

/** The generated cover: an icon tile and a short product-style readout. `image` replaces it when set. */
export interface BlogCover {
  icon: string;
  label: string;
  value: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: BlogAuthor;
  /** ISO date, e.g. 2026-11-12. */
  date: string;
  readMinutes: number;
  cover: BlogCover;
  image?: { src: string; alt: string };
  featured?: boolean;
  /** Higher reads first under "Most read". */
  popularity?: number;
  tags?: string[];
  /** Article body. PENDING CMS: posts without one render their excerpt and a short note. */
  body?: PostBlock[];
  /** ISO date of the last edit, when it differs from `date`. */
  updated?: string;
}

/* ---------- Article body: a small block model a CMS rich-text field maps onto ---------- */

/** Inline text with optional bold lead, e.g. "**Scope creep:** New requests...". */
export interface RichLine { lead?: string; text: string }

/** `body` images fill the text column; `info` images are infographics with readable text inside. */
export type PostImageKind = 'body' | 'info';

export type PostBlock =
  | { type: 'paragraph'; text: string; lead?: boolean }
  | { type: 'heading'; text: string; id?: string; level?: 2 | 3 }
  | { type: 'list'; items: RichLine[]; ordered?: boolean }
  | { type: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { type: 'image'; kind: PostImageKind; src?: string; alt: string; caption?: string; width?: number; height?: number }
  | { type: 'steps'; title: string; caption?: string; items: { title: string; text: string; icon: string }[] }
  | { type: 'quote'; text: string; cite?: string };

/**
 * Image sizes for the marketing team (see docs/implementation/blog-images.md). The page renders them at the
 * column width; these are the source files to upload.
 */
export const IMAGE_SPECS = {
  feature: { ratio: '16:9', min: [1600, 900], max: [2400, 1350], maxKb: 300, formats: 'WebP or JPG' },
  body: { ratio: '16:9', min: [1600, 900], max: [2400, 1350], maxKb: 250, formats: 'WebP or JPG' },
  info: { ratio: 'free height', min: [1600, 0], max: [1600, 2400], maxKb: 400, formats: 'PNG or WebP', minTextPx: 32 },
} as const;

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export interface TocEntry { id: string; text: string }

/** Gives every level-2 heading a stable id and returns the table of contents in reading order. */
export function withHeadingIds(blocks: readonly PostBlock[]): { blocks: PostBlock[]; toc: TocEntry[] } {
  const seen = new Map<string, number>();
  const toc: TocEntry[] = [];
  const out = blocks.map((b) => {
    if (b.type !== 'heading') return b;
    const base = b.id ?? slugify(b.text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    if ((b.level ?? 2) === 2) toc.push({ id, text: b.text });
    return { ...b, id };
  });
  return { blocks: out, toc };
}

/** Same category first, then the newest; never the post itself. */
export function relatedPosts<T extends Pick<BlogPost, 'slug' | 'category' | 'date'>>(post: T, all: readonly T[], limit = 6): T[] {
  return [...all]
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category) || b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** Internal links in a body, for the build's link checks. */
export const bodyLinks = (blocks: readonly PostBlock[] = []): string[] =>
  blocks.flatMap((b) => (b.type === 'paragraph' ? [...b.text.matchAll(/\]\((\/[^)\s]+)\)/g)].map((m) => m[1] ?? '') : [])).filter(Boolean);

export type BlogSort = 'latest' | 'popular';

export interface BlogQuery {
  category: string;
  search: string;
  sort: BlogSort;
}

export const DEFAULT_QUERY: BlogQuery = { category: '', search: '', sort: 'latest' };

export const postHref = (slug: string): string => `/blog/${slug}`;

/** Short date for cards: 12 Nov 2026. */
export const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Text a search box matches against, lower-cased once. */
export const searchText = (p: BlogPost): string =>
  [p.title, p.excerpt, p.category, p.author.name, ...(p.tags ?? [])].join(' ').toLowerCase();

export const isFiltering = (q: BlogQuery): boolean => q.category !== '' || q.search.trim() !== '';

/** The featured card shows only on the default view: no filter, newest first. */
export const showsFeatured = (q: BlogQuery, page: number): boolean => !isFiltering(q) && q.sort === 'latest' && page === 1;

export function sortPosts<T extends Pick<BlogPost, 'date' | 'popularity'>>(posts: readonly T[], sort: BlogSort): T[] {
  const list = [...posts];
  return sort === 'popular'
    ? list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    : list.sort((a, b) => b.date.localeCompare(a.date));
}

export interface Paged<T> {
  items: T[];
  page: number;
  pages: number;
  total: number;
}

export function paginate<T>(items: readonly T[], page: number, size: number): Paged<T> {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages, total: items.length };
}

/** Page numbers with gaps: 1 … 7 8 [9] 10 11 … 29. `0` marks a gap. */
export function pageItems(page: number, pages: number, around = 2): number[] {
  if (pages <= 1) return [1];
  const out = [1];
  const from = Math.max(2, page - around);
  const to = Math.min(pages - 1, page + around);
  if (from > 2) out.push(0);
  for (let i = from; i <= to; i++) out.push(i);
  if (to < pages - 1) out.push(0);
  out.push(pages);
  return out;
}

export const countBy = (posts: readonly BlogPost[], category: string): number =>
  category ? posts.filter((p) => p.category === category).length : posts.length;

/** Long date for the post header: 12 November 2026. */
export const formatLongDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/* ---------- Inline text: **bold** and [label](/path) only, so CMS text stays simple and safe ---------- */

export type InlinePart = { kind: 'text'; text: string } | { kind: 'bold'; text: string } | { kind: 'link'; text: string; href: string };

export function inlineParts(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ kind: 'text', text: text.slice(last, i) });
    if (m[1] !== undefined) parts.push({ kind: 'bold', text: m[1] });
    else parts.push({ kind: 'link', text: m[2] ?? '', href: m[3] ?? '#' });
    last = i + m[0].length;
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) });
  return parts;
}
