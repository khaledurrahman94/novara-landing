/**
 * Blog explorer in the browser: category, search, sort, popular tags and numbered pagination over the cards the
 * server rendered. All rules come from src/lib/blog.ts; this file only reads and writes the DOM.
 */
import { blog } from '../../content/blog';
import { DEFAULT_QUERY, isFiltering, pageItems, paginate, showsFeatured, sortPosts, type BlogQuery, type BlogSort } from '../../lib/blog';

interface Card { el: HTMLElement; featured: boolean; category: string; date: string; popularity: number; search: string }

export function initBlogExplorer(root: HTMLElement): void {
  const list = root.querySelector<HTMLElement>('[data-blog-list]');
  const search = root.querySelector<HTMLInputElement>('[data-blog-search]');
  const status = root.querySelector<HTMLElement>('[data-blog-status]');
  const empty = root.querySelector<HTMLElement>('[data-blog-empty]');
  const pager = root.querySelector<HTMLElement>('[data-blog-pager]');
  const pagesEl = root.querySelector<HTMLElement>('[data-blog-pages]');
  const prev = root.querySelector<HTMLButtonElement>('[data-blog-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-blog-next]');
  if (!list || !search || !status || !empty || !pager || !pagesEl || !prev || !next) return;

  const size = Number(root.dataset.pageSize) || blog.index.pageSize;
  const copy = blog.index;
  const cards: Card[] = [...list.querySelectorAll<HTMLElement>('[data-post]')].map((el) => ({
    el,
    featured: el.dataset.featured !== undefined,
    category: el.dataset.category ?? '',
    date: el.dataset.date ?? '',
    popularity: Number(el.dataset.popularity) || 0,
    search: el.dataset.search ?? '',
  }));
  const catButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-blog-cat]')];
  const sortButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-blog-sort]')];

  const query: BlogQuery = { ...DEFAULT_QUERY };
  let page = 1;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pressed = (buttons: HTMLButtonElement[], match: (b: HTMLButtonElement) => boolean): void =>
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(match(b))));

  function render(scroll = false): void {
    const q = query.search.trim().toLowerCase();
    const matches = cards.filter((c) => (!query.category || c.category === query.category) && (!q || c.search.includes(q)));
    const withFeatured = showsFeatured(query, 1);
    const pool = sortPosts(withFeatured ? matches.filter((c) => !c.featured) : matches, query.sort);
    const paged = paginate(pool, page, size);
    page = paged.page;
    const showFeature = showsFeatured(query, page);
    const visible = [...(showFeature ? cards.filter((c) => c.featured && matches.includes(c)) : []), ...paged.items];

    cards.forEach((c) => { c.el.hidden = true; });
    visible.forEach((c, i) => {
      list!.appendChild(c.el);
      c.el.hidden = false;
      if (!reduced) {
        c.el.classList.remove('blog-in');
        void c.el.offsetWidth;
        c.el.style.animationDelay = `${Math.min(i, 6) * 40}ms`;
        c.el.classList.add('blog-in');
      }
    });

    empty!.hidden = matches.length > 0;
    renderPager(paged.page, paged.pages);
    const n = matches.length;
    const what = isFiltering(query)
      ? `${n} article${n === 1 ? '' : 's'}${query.category ? ` in ${query.category}` : ''}${q ? ` for “${query.search.trim()}”` : ''}`
      : query.sort === 'popular' ? copy.popular : copy.latest;
    status!.textContent = paged.pages > 1 ? `${what} · ${copy.pagination.page} ${paged.page} of ${paged.pages}` : what;
    if (scroll) root.closest('section')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  function renderPager(current: number, pages: number): void {
    pager!.hidden = pages <= 1;
    prev!.disabled = current <= 1;
    next!.disabled = current >= pages;
    pagesEl!.replaceChildren(...pageItems(current, pages).map((n) => {
      const li = document.createElement('li');
      if (n === 0) {
        li.className = 'blog-gap';
        li.setAttribute('aria-hidden', 'true');
        li.textContent = '…';
        return li;
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'blog-page';
      b.dataset.page = String(n);
      b.textContent = String(n);
      b.setAttribute('aria-label', `${copy.pagination.page} ${n}`);
      if (n === current) b.setAttribute('aria-current', 'page');
      li.appendChild(b);
      return li;
    }));
  }

  const update = (patch: Partial<BlogQuery>): void => {
    Object.assign(query, patch);
    page = 1;
    render();
  };

  catButtons.forEach((b) => b.addEventListener('click', () => {
    pressed(catButtons, (x) => x === b);
    update({ category: b.dataset.blogCat ?? '' });
  }));
  sortButtons.forEach((b) => b.addEventListener('click', () => {
    pressed(sortButtons, (x) => x === b);
    update({ sort: (b.dataset.blogSort as BlogSort) ?? 'latest' });
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-blog-tag]').forEach((b) => b.addEventListener('click', () => {
    search!.value = b.dataset.blogTag ?? '';
    pressed(catButtons, (x) => x.dataset.blogCat === '');
    update({ search: search!.value, category: '' });
  }));
  let t: number | undefined;
  search.addEventListener('input', () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => update({ search: search!.value }), 120);
  });
  root.querySelector('[data-blog-reset]')?.addEventListener('click', () => {
    search!.value = '';
    pressed(catButtons, (x) => x.dataset.blogCat === '');
    update({ category: '', search: '' });
  });
  prev.addEventListener('click', () => { page -= 1; render(true); });
  next.addEventListener('click', () => { page += 1; render(true); });
  pagesEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-page]');
    if (!b) return;
    page = Number(b.dataset.page);
    render(true);
  });

  render();
}
