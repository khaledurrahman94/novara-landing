/**
 * Platform bento: every tile is something you can use, and every tile keeps itself busy.
 * Each tile runs a small ambient loop (a slot gets booked, a card moves on, the embed code is
 * copied, a permission flips, a name is typed into the template, the analytics view changes).
 * The loops are presence aware: when a pointer or focus arrives, the tile finishes its current
 * step and then stays calm and fully interactive; about 2s after it leaves, the loop resumes.
 * Loops pause off screen. Under reduced motion there are no loops and every interaction still
 * works with instant state changes. No tile tilts or follows the cursor.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { Flip } from 'gsap/Flip';
import { v3 } from '../../../content/v3';
import { $, EASE, num, one } from './util';

gsap.registerPlugin(Flip);

const p = v3.platform;

/** Every animation an ambient step starts, so cleanup can stop them. */
const live = new Set<gsap.core.Animation>();
/** Run one ambient step as a timeline and resolve when it finishes. */
const step = (build: (tl: gsap.core.Timeline) => void): Promise<void> =>
  new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });
    live.add(tl);
    build(tl);
  });

/**
 * Run `stepFn` forever with `gap` seconds between steps, starting `first` seconds after the tile
 * is on screen. It stops while the tile is off screen or the user is present (pointer or focus)
 * and resumes 2s after they leave. A step already running is always allowed to finish.
 */
function ambient(tile: HTMLElement, stepFn: () => Promise<void>, first: number, gap: number): () => void {
  let visible = false;
  let present = false;
  let busy = false;
  let alive = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let resume: ReturnType<typeof setTimeout> | undefined;

  const queue = (sec: number): void => {
    clearTimeout(timer);
    if (!alive || !visible || present || busy || document.hidden) return;
    timer = setTimeout(() => void run(), sec * 1000);
  };
  const run = async (): Promise<void> => {
    if (!alive || !visible || present || busy || document.hidden) return;
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
  const enter = (): void => {
    present = true;
    clearTimeout(timer);
    clearTimeout(resume);
  };
  const leave = (): void => {
    if (tile.matches(':focus-within')) return;
    present = false;
    clearTimeout(resume);
    resume = setTimeout(() => queue(0), 2000);
  };
  const onFocusOut = (e: FocusEvent): void => {
    if (!tile.contains(e.relatedTarget as Node | null)) leave();
  };
  const onVisibility = (): void => queue(gap);
  tile.addEventListener('pointerenter', enter);
  tile.addEventListener('pointerleave', leave);
  tile.addEventListener('focusin', enter);
  tile.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    alive = false;
    clearTimeout(timer);
    clearTimeout(resume);
    io.disconnect();
    tile.removeEventListener('pointerenter', enter);
    tile.removeEventListener('pointerleave', leave);
    tile.removeEventListener('focusin', enter);
    tile.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

interface Tile {
  cleanup: () => void;
  /** One ambient step, if the tile has one. */
  step?: () => Promise<void>;
}
const NOOP: Tile = { cleanup: () => undefined };

/** Pipeline: cards lift on hover (CSS) and take focus. Ambient: one card moves on to the next column. */
function pipeline(root: HTMLElement): Tile {
  const board = one(root, '[data-tile="pipeline"] [data-card="pipeline"]');
  if (!board) return NOOP;
  const cards = $(board, '[data-anim]');
  cards.forEach((el) => el.setAttribute('tabindex', '0'));
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
        const f = Flip.from(state, { duration: 0.75, ease: 'power3.inOut', onComplete: resolve });
        live.add(f);
      }),
  };
}

function scheduling(root: HTMLElement, reduced: boolean): Tile {
  const sched = one(root, '[data-sched]');
  const grid = one(root, '[data-slot-grid]');
  const pick = one(root, '[data-pick]');
  const booked = one(root, '[data-booked]');
  const previous = one(root, '[data-previous]');
  const toast = one(root, '[data-toast]');
  if (!sched || !grid || !pick || !booked || !previous || !toast) return NOOP;
  const day = sched.dataset['day'] ?? '';
  const buttons = $(grid, '[role="radio"]');
  let current = buttons.find((b) => b.getAttribute('aria-checked') === 'true');
  let timer: ReturnType<typeof setTimeout> | undefined;

  const place = (btn: HTMLElement, animate: boolean): void => {
    const x = btn.offsetLeft - pick.offsetLeft;
    const y = btn.offsetTop - pick.offsetTop;
    if (animate && !reduced) gsap.to(pick, { x, y, duration: 0.6, ease: 'back.out(1.5)', overwrite: true });
    else gsap.set(pick, { x, y });
  };
  const flash = (text: string): void => {
    toast.textContent = text;
    clearTimeout(timer);
    if (reduced) gsap.set(toast, { opacity: 1, y: 0 });
    else gsap.fromTo(toast, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: EASE, overwrite: true });
    timer = setTimeout(() => gsap.to(toast, { opacity: 0, y: reduced ? 0 : 6, duration: reduced ? 0 : 0.3, overwrite: true }), 2600);
  };
  /** Book a slot. The ambient loop books silently: no toast, so screen readers are not interrupted. */
  const choose = (btn: HTMLElement, silent: boolean): void => {
    if (btn === current) return;
    current = btn;
    buttons.forEach((b) => b.setAttribute('aria-checked', b === btn ? 'true' : 'false'));
    previous.textContent = booked.textContent;
    booked.textContent = `${day}, ${btn.dataset['time'] ?? ''}`;
    place(btn, true);
    if (!silent) flash(`Interview booked for ${day}, ${btn.dataset['time'] ?? ''}`);
    else if (!reduced) gsap.fromTo([booked, previous], { opacity: 0.25, y: 4 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE, overwrite: 'auto' });
  };
  const handlers = buttons.map((btn) => {
    const onClick = (): void => choose(btn, false);
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  });
  const onResize = (): void => {
    if (current) place(current, false);
  };
  window.addEventListener('resize', onResize);
  if (current) place(current, false);
  return {
    step: () =>
      step((tl) => {
        const i = current ? buttons.indexOf(current) : -1;
        const next = buttons[(i + 1) % buttons.length];
        if (next) choose(next, true);
        tl.to({}, { duration: 1 });
      }),
    cleanup: () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      handlers.forEach((h) => h());
    },
  };
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

function career(root: HTMLElement, reduced: boolean): Tile {
  const btn = one(root, '[data-copy]');
  const label = one(root, '[data-copy-label]');
  const status = one(root, '[data-copy-status]');
  if (!btn || !label || !status) return NOOP;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const onClick = async (): Promise<void> => {
    let lines: string[] = [];
    try {
      lines = JSON.parse(btn.dataset['embed'] ?? '[]') as string[];
    } catch {
      lines = [];
    }
    const ok = await copyText(lines.join('\n'));
    clearTimeout(timer);
    label.textContent = ok ? p.copied : p.copyEmbed;
    status.textContent = ok ? p.copied : p.copyFail;
    if (!reduced) gsap.fromTo(label, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: EASE, overwrite: true });
    if (ok) timer = setTimeout(() => void (label.textContent = p.copyEmbed), 2000);
  };
  btn.addEventListener('click', onClick);
  return {
    // Ambient: the button shows "Copied" for a moment. It never touches the clipboard.
    step: () =>
      step((tl) => {
        tl.call(() => void (label.textContent = p.copied))
          .fromTo(btn, { scale: 1 }, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' }, 0)
          .fromTo(label, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: EASE }, 0)
          .to({}, { duration: 1.5 })
          .call(() => void (label.textContent = p.copyEmbed));
      }),
    cleanup: () => {
      clearTimeout(timer);
      btn.removeEventListener('click', onClick);
    },
  };
}

function roles(root: HTMLElement): Tile {
  const switches = $(root, '[data-tile="roles"] [role="switch"]');
  const handlers = switches.map((sw) => {
    const onClick = (): void => sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    sw.addEventListener('click', onClick);
    return () => sw.removeEventListener('click', onClick);
  });
  // Ambient: one toggle flips at a time. Each one flips twice per lap, so a lap returns to the start.
  const order = [switches[4], switches[3], switches[5], switches[4], switches[3], switches[5]].filter((x): x is HTMLElement => !!x);
  let k = 0;
  return {
    step: () =>
      step((tl) => {
        const sw = order[k++ % Math.max(1, order.length)];
        if (sw) sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
        tl.to({}, { duration: 0.7 });
      }),
    cleanup: () => handlers.forEach((h) => h()),
  };
}

function email(root: HTMLElement): Tile {
  const input = one(root, '[data-name-input]') as HTMLInputElement | null;
  const chip = one(root, '[data-name-chip]');
  const restore = one(root, '[data-restore]');
  const save = one(root, '[data-save]');
  const saveLabel = one(root, '[data-save-label]');
  const status = one(root, '[data-email-status]');
  if (!input || !chip || !restore || !save || !saveLabel || !status) return NOOP;
  const fallback = chip.dataset['default'] ?? '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const sync = (): void => void (chip.textContent = input.value.trim() || fallback);
  /** The last value the ambient loop wrote. If the input differs, the visitor changed it and the loop stays out. */
  let written = '';
  const names = ['Amara', 'Ines', 'Leo'];
  let n = 0;
  const onRestore = (): void => {
    input.value = '';
    written = '';
    sync();
    status.textContent = 'Default template restored.';
  };
  const onSave = (): void => {
    saveLabel.textContent = p.saved;
    status.textContent = p.saved;
    clearTimeout(timer);
    timer = setTimeout(() => void (saveLabel.textContent = p.save), 1600);
  };
  input.addEventListener('input', sync);
  restore.addEventListener('click', onRestore);
  save.addEventListener('click', onSave);
  return {
    // Ambient: the template empties, then a candidate name is typed into {{candidate_name}}.
    step: () =>
      step((tl) => {
        if (input.value !== written || document.activeElement === input) return void tl.to({}, { duration: 0.1 });
        const name = names[n++ % names.length] ?? '';
        input.value = '';
        written = '';
        sync();
        const o = { c: 0 };
        let aborted = false;
        tl.fromTo(chip, { opacity: 0.4 }, { opacity: 1, duration: 0.3, ease: EASE })
          .to(o, {
            c: name.length,
            duration: name.length * 0.11,
            ease: 'none',
            onUpdate: () => {
              if (aborted || input.value !== written) {
                aborted = true;
                return;
              }
              written = name.slice(0, Math.round(o.c));
              input.value = written;
              sync();
            },
          }, 0.5)
          .to({}, { duration: 1.4 });
      }),
    cleanup: () => {
      clearTimeout(timer);
      input.removeEventListener('input', sync);
      restore.removeEventListener('click', onRestore);
      save.removeEventListener('click', onSave);
    },
  };
}

interface Trend {
  tabs: string[];
  data: Record<string, number[]>;
  weeks: string[];
}

function analytics(root: HTMLElement, reduced: boolean): Tile {
  const box = one(root, '[data-analytics]');
  if (!box) return NOOP;
  let trend: Trend;
  try {
    trend = JSON.parse(box.dataset['trend'] ?? '') as Trend;
  } catch {
    return NOOP;
  }
  const tabs = $(box, '[role="tab"]');
  const values = $(box, '[data-value]');
  const bars = $(box, '[data-bar]');
  const barBtns = $(box, '[data-bar-btn]');
  const readout = one(box, '[data-readout]');
  if (!readout) return NOOP;
  let tab = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset['tab'] ?? trend.tabs[0] ?? '';
  const series = (): number[] => trend.data[tab] ?? [];
  const label = (i: number): string => `${trend.weeks[i] ?? ''}: ${series()[i] ?? 0} ${tab.toLowerCase()}`;

  const render = (animate: boolean): void => {
    const data = series();
    const max = Math.max(1, ...data);
    bars.forEach((bar, i) => {
      const s = Math.max(0.04, (data[i] ?? 0) / max);
      if (animate && !reduced) gsap.to(bar, { scaleY: s, duration: 0.8, delay: i * 0.05, ease: EASE, overwrite: true });
      else gsap.set(bar, { scaleY: s });
    });
    values.forEach((el, i) => {
      const to = data[i] ?? 0;
      const from = num(el.textContent ?? '0');
      if (animate && !reduced) {
        const o = { v: from };
        gsap.to(o, { v: to, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => void (el.textContent = String(Math.round(o.v))) });
      } else el.textContent = String(to);
    });
    barBtns.forEach((b, i) => b.setAttribute('aria-label', label(i)));
    readout.textContent = p.hoverBar;
  };

  const select = (t: HTMLElement): void => {
    if (t.dataset['tab'] === tab) return;
    tab = t.dataset['tab'] ?? tab;
    tabs.forEach((x) => x.setAttribute('aria-selected', x === t ? 'true' : 'false'));
    render(true);
  };
  const tabHandlers = tabs.map((t) => {
    const onClick = (): void => select(t);
    t.addEventListener('click', onClick);
    return () => t.removeEventListener('click', onClick);
  });
  const barHandlers = barBtns.map((b, i) => {
    const on = (): void => {
      readout.textContent = label(i);
      values[i]?.classList.add('text-primary');
    };
    const off = (): void => {
      readout.textContent = p.hoverBar;
      values[i]?.classList.remove('text-primary');
    };
    b.addEventListener('pointerenter', on);
    b.addEventListener('focus', on);
    b.addEventListener('pointerleave', off);
    b.addEventListener('blur', off);
    return () => {
      b.removeEventListener('pointerenter', on);
      b.removeEventListener('focus', on);
      b.removeEventListener('pointerleave', off);
      b.removeEventListener('blur', off);
    };
  });
  render(false);
  return {
    // Ambient: the view switches to the next tab and the bars morph to its values.
    step: () =>
      step((tl) => {
        const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
        const next = tabs[(i + 1) % tabs.length];
        if (next) select(next);
        tl.to({}, { duration: 1.1 });
      }),
    cleanup: () => {
      tabHandlers.forEach((h) => h());
      barHandlers.forEach((h) => h());
    },
  };
}

/** Interactions. These run under reduced motion too; the ambient loops do not. */
export function initPlatform(root: HTMLElement, reduced: boolean): () => void {
  const tiles: [string, Tile, number][] = [
    ['pipeline', pipeline(root), 0.8],
    ['scheduling', scheduling(root, reduced), 1.8],
    ['career', career(root, reduced), 2.8],
    ['roles', roles(root), 3.6],
    ['email', email(root), 4.4],
    ['analytics', analytics(root, reduced), 5.4],
  ];
  const cleanups = tiles.map(([, t]) => t.cleanup);
  if (!reduced) {
    tiles.forEach(([name, t, first]) => {
      const el = one(root, `[data-tile="${name}"]`);
      if (el && t.step) cleanups.push(ambient(el, t.step, first, 2.6));
    });
  }
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
