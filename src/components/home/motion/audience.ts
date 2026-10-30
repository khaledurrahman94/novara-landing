/**
 * Who it is for. Large screens: the section pins and steps through the four groups as the visitor scrolls, snapping
 * to each one, with the tab list and a thin progress line following. Elsewhere: a plain tablist with one panel at a
 * time. Reduced motion: all four panels stacked. The tabs stay real buttons; in the pinned mode a click or arrow key
 * scrolls to that group's stop. Arrow keys, Home and End move between tabs.
 */
import { gsap, ScrollTrigger, getLenis } from '../../../scripts/motion';
import { $, navH, one } from './util';

export interface AudienceControl {
  /** Pin and step through the groups on scroll. Returns the cleanup. */
  pin: () => (() => void) | void;
  destroy: () => void;
}

export function initAudience(root: HTMLElement, reduced: boolean): AudienceControl | void {
  const tabs = $(root, '[data-aud-tab]');
  const panels = $(root, '[data-aud-panel]');
  const progress = one(root, '[data-aud-progress]');
  const line = one(root, '[data-aud-line]');
  const tablist = one(root, '[role="tablist"]');
  if (!tabs.length || tabs.length !== panels.length) return;

  const n = tabs.length;
  let current = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  let stopTo: ((i: number) => void) | null = null;

  if (reduced) {
    // Every group readable, nothing to switch: the tab list is hidden and the panels are plain blocks.
    if (tablist) tablist.hidden = true;
    panels.forEach((p) => {
      p.hidden = false;
      p.removeAttribute('role');
      p.removeAttribute('aria-labelledby');
    });
    root.dataset['audMode'] = 'stacked';
    return { pin: () => undefined, destroy: () => undefined };
  }

  const mark = (i: number): void => {
    current = i;
    tabs.forEach((tab, j) => {
      const on = i === j;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panels[j]!.dataset['active'] = on ? 'true' : 'false';
    });
  };
  const select = (i: number, focus = false): void => {
    if (stopTo) stopTo(i);
    else {
      mark(i);
      panels.forEach((p, j) => void (p.hidden = j !== i));
    }
    if (focus) tabs[i]?.focus({ preventScroll: true });
  };

  const handlers = tabs.map((tab, i) => {
    const onClick = (): void => select(i);
    const onKey = (e: KeyboardEvent): void => {
      const last = n - 1;
      const next =
        e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
        : e.key === 'Home' ? 0
        : e.key === 'End' ? last
        : -1;
      if (next < 0) return;
      e.preventDefault();
      select(next, true);
    };
    tab.addEventListener('click', onClick);
    tab.addEventListener('keydown', onKey);
    return () => {
      tab.removeEventListener('click', onClick);
      tab.removeEventListener('keydown', onKey);
    };
  });

  select(current);

  const pin = (): (() => void) | void => {
    if (!progress || !line) return;
    root.classList.add('is-pinned');
    progress.hidden = false;
    panels.forEach((p) => void (p.hidden = false));
    mark(current);

    // Stop i sits at HOLD + i of (n - 1 + 2 * HOLD) timeline units, with a little rest at both ends.
    const HOLD = 0.35;
    const total = n - 1 + 2 * HOLD;
    const stop = (i: number): number => (HOLD + i) / total;
    const points = [0, ...tabs.map((_, i) => stop(i)), 1];
    const st = ScrollTrigger.create({
      trigger: root,
      start: () => `top ${navH() + 16}px`,
      end: () => `+=${Math.round(total * window.innerHeight * 0.8)}`,
      pin: true,
      anticipatePin: 1,
      refreshPriority: 0,
      invalidateOnRefresh: true,
      // Same behaviour as How it works: settle on a group, one group per flick, always able to scroll out.
      snap: { snapTo: points, duration: { min: 0.4, max: 0.6 }, delay: 0.08, ease: 'power2.inOut', directional: true, inertia: false },
      onUpdate: (self) => {
        const i = Math.min(n - 1, Math.max(0, Math.round(self.progress * total - HOLD)));
        if (i !== current) mark(i);
        const fill = Math.min(1, Math.max(0, (self.progress * total - HOLD) / (n - 1)));
        gsap.set(line, { scaleX: fill });
      },
    });
    gsap.set(line, { scaleX: 0 });
    stopTo = (i: number): void => {
      const y = st.start + stop(i) * (st.end - st.start);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: 'smooth' });
    };
    return () => {
      stopTo = null;
      st.kill();
      root.classList.remove('is-pinned');
      progress.hidden = true;
      gsap.set(line, { clearProps: 'transform' });
      panels.forEach((p, j) => void (p.hidden = j !== current));
      mark(current);
    };
  };

  return {
    pin,
    destroy: () => {
      handlers.forEach((h) => h());
      stopTo = null;
    },
  };
}
