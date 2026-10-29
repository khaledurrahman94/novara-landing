/** Who it is for: a tablist with a detail panel per group. Arrow keys, Home and End move between tabs. */
import { $ } from './util';

export function initAudience(root: HTMLElement): void {
  const tabs = $(root, '[data-aud-tab]');
  const panels = $(root, '[data-aud-panel]');
  if (!tabs.length || tabs.length !== panels.length) return;

  const select = (i: number, focus = false): void => {
    tabs.forEach((tab, j) => {
      const on = i === j;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panels[j]!.hidden = !on;
    });
    if (focus) tabs[i]?.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      const next =
        e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
        : e.key === 'Home' ? 0
        : e.key === 'End' ? last
        : -1;
      if (next < 0) return;
      e.preventDefault();
      select(next, true);
    });
  });

  const start = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  select(start < 0 ? 0 : start);
}
