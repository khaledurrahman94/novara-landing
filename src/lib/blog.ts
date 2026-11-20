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
}

export type BlogSort = 'latest' | 'popular';

export interface BlogQuery {
  category: string;
  search: string;
  sort: BlogSort;
}

export const DEFAULT_QUERY: BlogQuery = { category: '', search: '', sort: 'latest' };

export const postHref = (slug: string): string => `/blog/${slug}`;

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
