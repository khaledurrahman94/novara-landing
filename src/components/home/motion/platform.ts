/**
 * Platform bento: every tile plays by itself. Each tile runs a small loop that shows the product doing its job:
 * the dashboard chart calls out each bar, a card moves on in the pipeline, a slot gets booked, the career page
 * switches layout and theme and copies its embed code, the selected role changes, the analytics view changes and
 * each bar is highlighted in turn.
 * Nothing reacts to the pointer or keyboard. The loops run only while their tile is on screen and the tab is
 * visible. Under reduced motion there are no loops: the tiles keep their start state.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { Flip } from 'gsap/Flip';
import { home } from '../../../content/home';
import { $, EASE, num, one } from './util';

gsap.registerPlugin(Flip);

const p = home.platform;

/** Every animation an ambient step starts, so cleanup can stop them. */
const live = new Set<gsap.core.Animation>();
/** Run one ambient step as a timeline and resolve when it finishes. */
const step = (build: (tl: gsap.core.Timeline) => void): Promise<void> =>
  new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        live.delete(tl);
        resolve();
      },
    });
    live.add(tl);
    build(tl);
  });

/**
 * Run `stepFn` forever with `gap` seconds between steps, starting `first` seconds after the tile is on
 * screen. It stops while the tile is off screen or the tab is hidden. A step already running always finishes.
 */
function ambient(tile: HTMLElement, stepFn: () => Promise<void>, first: number, gap: number): () => void {
  let visible = false;
  let busy = false;
  let alive = true;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const queue = (sec: number): void => {
    clearTimeout(timer);
    if (!alive || !visible || busy || document.hidden) return;
    timer = setTimeout(() => void run(), sec * 1000);
  };
  const run = async (): Promise<void> => {
    if (!alive || !visible || busy || document.hidden) return;
    busy = true;
    try {
      await stepFn();
    } catch {
      /* a failed step just skips */
    }
    busy = false;
    queue(gap);
  };
  const io = new IntersectionObserver(
    ([e]) => {
      visible = !!e?.isIntersecting;
      if (visible) queue(first);
      else clearTimeout(timer);
    },
    { threshold: 0.25 },
  );
  io.observe(tile);
  const onVisibility = (): void => queue(gap);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    alive = false;
    clearTimeout(timer);
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

interface Tile {
  cleanup: () => void;
  /** One loop step, if the tile has one. */
  step?: () => Promise<void>;
}
const NOOP: Tile = { cleanup: () => undefined };

/** Dashboard: a callout with the stage counts moves over each bar of the jobs chart in turn. */
function dashboard(root: HTMLElement): Tile {
  const cols = $(root, '[data-tile="dashboard"] [data-job-col]');
  const tips = cols.map((c) => one(c, '[data-job-tip]'));
  if (!cols.length || tips.some((t) => !t)) return NOOP;
  return {
    cleanup: () => undefined,
    step: () =>
      step((tl) => {
        tips.forEach((tip, i) => {
          if (!tip) return;
          const at = i * 1.4;
          tl.fromTo(tip, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: EASE }, at);
          tl.to(tip, { autoAlpha: 0, y: 8, duration: 0.3, ease: 'power2.in' }, at + 1.05);
        });
      }),
  };
}

/** Pipeline: one card moves on to the next column. */
function pipeline(root: HTMLElement): Tile {
  const board = one(root, '[data-tile="pipeline"] [data-card="pipeline"]');
  if (!board) return NOOP;
  const cards = $(board, '[data-anim]');
  const columns = $(board, 'section');
  const lists = columns.map((c) => one(c, 'ul'));
  const mover = cards.find((c) => c.dataset['anim'] === 'board-card');
  const counts = columns.map((c) => one(c, 'h4 > span.ml-auto'));
  if (!mover || lists.some((l) => !l)) return NOOP;
  const recount = (): void => lists.forEach((l, i) => void (counts[i] && l && (counts[i].textContent = String(l.children.length))));
  return {
    cleanup: () => undefined,
    step: () =>
      new Promise<void>((resolve) => {
        const from = lists.findIndex((l) => l?.contains(mover));
        const to = (from + 1) % lists.length;
        const target = lists[to];
        if (!target) return resolve();
        const state = Flip.getState(cards);
        target.prepend(mover);
        recount();
        const f = Flip.from(state, {
          duration: 0.75,
          ease: 'power3.inOut',
          onComplete: () => {
            live.delete(f);
            resolve();
          },
        });
        live.add(f);
      }),
  };
}

/** Scheduling: the booked slot moves to the next time and a confirmation appears. The old booking stays on record. */
function scheduling(root: HTMLElement): Tile {
  const sched = one(root, '[data-sched]');
  const pick = one(root, '[data-pick]');
  const booked = one(root, '[data-booked]');
  const previous = one(root, '[data-previous]');
  const toast = one(root, '[data-toast]');
  if (!sched || !pick || !booked || !previous || !toast) return NOOP;
  const day = sched.dataset['day'] ?? '';
  const times = $(sched, '[data-time]');
  let current = times.find((b) => b.dataset['selected'] === 'true');
  let timer: ReturnType<typeof setTimeout> | undefined;

  const place = (el: HTMLElement, animate: boolean): void => {
    const x = el.offsetLeft - pick.offsetLeft;
    const y = el.offsetTop - pick.offsetTop;
    if (animate) gsap.to(pick, { x, y, duration: 0.6, ease: 'back.out(1.5)', overwrite: true });
    else gsap.set(pick, { x, y });
  };
  const choose = (el: HTMLElement): void => {
    if (el === current) return;
    current = el;
    times.forEach((b) => void (b.dataset['selected'] = b === el ? 'true' : 'false'));
    previous.textContent = booked.textContent;
    booked.textContent = `${day}, ${el.dataset['time'] ?? ''}`;
    place(el, true);
    toast.textContent = `Interview booked for ${day}, ${el.dataset['time'] ?? ''}`;
    clearTimeout(timer);
    gsap.fromTo(toast, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: EASE, overwrite: true });
    timer = setTimeout(() => gsap.to(toast, { opacity: 0, y: 6, duration: 0.3, overwrite: true }), 2000);
    gsap.fromTo([booked, previous], { opacity: 0.25, y: 4 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE, overwrite: 'auto' });
  };
  const onResize = (): void => {
    if (current) place(current, false);
  };
  window.addEventListener('resize', onResize);
  if (current) place(current, false);
  return {
    step: () =>
      step((tl) => {
        const i = current ? times.indexOf(current) : -1;
        const next = times[(i + 1) % times.length];
        if (next) choose(next);
        tl.to({}, { duration: 1.4 });
      }),
    cleanup: () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    },
  };
}

/** Career page: the Layout and Theme options switch by themselves, then the embed code is "copied". */
function career(root: HTMLElement): Tile {
  const setup = one(root, '[data-career-setup]');
  const btn = one(root, '[data-copy]');
  const label = one(root, '[data-copy-label]');
  if (!setup || !btn || !label) return NOOP;
  const settings: ['layout' | 'theme', string][] = [
    ['layout', 'grid'],
    ['theme', 'light'],
    ['layout', 'list'],
    ['theme', 'auto'],
  ];
  let n = 0;
  const apply = (kind: 'layout' | 'theme', value: string): void => {
    if (kind === 'layout') {
      const cards = $(setup, '.cs-card');
      const state = Flip.getState(cards);
      setup.dataset['layout'] = value;
      const f = Flip.from(state, {
        duration: 0.6,
        ease: 'power3.inOut',
        scale: true,
        onComplete: () => void live.delete(f),
      });
      live.add(f);
    } else setup.dataset['theme'] = value;
    $(setup, `[data-opt^="${kind}:"]`).forEach((o) => void (o.dataset['on'] = o.dataset['opt'] === `${kind}:${value}` ? 'true' : 'false'));
  };
  return {
    step: () =>
      step((tl) => {
        const [kind, value] = settings[n % settings.length] ?? settings[0]!;
        n += 1;
        apply(kind, value);
        tl.to({}, { duration: 1.6 });
        // The embed code is "copied": the button presses and shows Copied for a moment. The clipboard is never touched.
        tl.call(() => void (label.textContent = p.copied))
          .fromTo(btn, { scale: 1 }, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' }, '<')
          .fromTo(label, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: EASE }, '<')
          .to({}, { duration: 1.5 })
          .call(() => void (label.textContent = p.copyEmbed));
      }),
    cleanup: () => undefined,
  };
}

interface Trend {
  tabs: string[];
  data: Record<string, number[]>;
  weeks: string[];
}

/** Analytics: the view switches to the next stage, the bars morph, then each bar is highlighted in turn with its week. */
function analytics(root: HTMLElement): Tile {
  const box = one(root, '[data-analytics]');
  if (!box) return NOOP;
  let trend: Trend;
  try {
    trend = JSON.parse(box.dataset['trend'] ?? '') as Trend;
  } catch {
    return NOOP;
  }
  const tabs = $(box, '[data-tab]');
  const values = $(box, '[data-value]');
  const bars = $(box, '[data-bar]');
  const readout = one(box, '[data-readout]');
  if (!readout) return NOOP;
  let tab = tabs.find((t) => t.dataset['on'] === 'true')?.dataset['tab'] ?? trend.tabs[0] ?? '';
  const series = (): number[] => trend.data[tab] ?? [];
  const label = (i: number): string => `Week of ${trend.weeks[i] ?? ''}: ${series()[i] ?? 0} ${tab.toLowerCase()}`;

  const render = (): void => {
    const data = series();
    const max = Math.max(1, ...data);
    bars.forEach((bar, i) => {
      const s = Math.max(0.04, (data[i] ?? 0) / max);
      gsap.to(bar, { scaleY: s, duration: 0.8, delay: i * 0.05, ease: EASE, overwrite: true });
    });
    values.forEach((el, i) => {
      const to = data[i] ?? 0;
      const o = { v: num(el.textContent ?? '0') };
      gsap.to(o, { v: to, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => void (el.textContent = String(Math.round(o.v))) });
    });
  };
  const highlight = (at: number): void => {
    bars.forEach((b, i) => void (b.dataset['on'] = i === at ? 'true' : 'false'));
    values.forEach((v, i) => void (v.dataset['on'] = i === at ? 'true' : 'false'));
    readout.textContent = at >= 0 ? label(at) : '';
  };
  const select = (t: HTMLElement): void => {
    tab = t.dataset['tab'] ?? tab;
    tabs.forEach((x) => void (x.dataset['on'] = x === t ? 'true' : 'false'));
    render();
  };
  return {
    step: () =>
      step((tl) => {
        const i = tabs.findIndex((t) => t.dataset['on'] === 'true');
        const next = tabs[(i + 1) % Math.max(1, tabs.length)];
        if (next) select(next);
        bars.forEach((_, k) => tl.call(() => highlight(k), undefined, 1.1 + k * 0.5));
        tl.call(() => highlight(-1), undefined, 1.1 + bars.length * 0.5);
      }),
    cleanup: () => highlight(-1),
  };
}

/** The tile loops. Not started under reduced motion. */
export function initPlatform(root: HTMLElement, reduced: boolean): () => void {
  if (reduced) return () => undefined;
  const tiles: [string, Tile, number][] = [
    ['dashboard', dashboard(root), 0.6],
    ['pipeline', pipeline(root), 0.8],
    ['scheduling', scheduling(root), 1.8],
    ['career', career(root), 2.8],
    ['analytics', analytics(root), 4.4],
  ];
  const cleanups = tiles.map(([, t]) => t.cleanup);
  tiles.forEach(([name, t, first]) => {
    const el = one(root, `[data-tile="${name}"]`);
    if (el && t.step) cleanups.push(ambient(el, t.step, first, 2.6));
  });
  return () => {
    cleanups.forEach((c) => c());
    live.forEach((a) => a.kill());
    live.clear();
  };
}

/** Tiles rise in once as they enter. Motion only. */
export function initBentoReveal(root: HTMLElement): void {
  const tiles = $(root, '[data-tile]');
  gsap.set(tiles, { autoAlpha: 0, y: 24 });
  ScrollTrigger.batch(tiles, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => void gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: EASE }),
  });
}
