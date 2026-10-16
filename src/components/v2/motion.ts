/**
 * V2 motion: one grammar. Content rises or draws in once, expo-out, at about 65% of the viewport.
 * No pinning. Hidden start states are set from JS only, so no-JS and reduced-motion users see every end state.
 */
import { gsap, ScrollTrigger, onReady, prefersReducedMotion, getLenis } from '../../scripts/motion';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = 'expo.out';
/** Mirrors the --duration-* tokens (seconds). */
const T = { fast: 0.15, base: 0.25, slow: 0.4, slower: 0.7 } as const;

const $ = (root: ParentNode, sel: string): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(sel));
const one = (root: ParentNode, sel: string): HTMLElement | null => root.querySelector<HTMLElement>(sel);
const num = (v: string | undefined, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const setCount = (el: HTMLElement, v: number): void => {
  el.textContent = Math.round(v).toLocaleString('en-US') + (el.dataset['suffix'] ?? '');
};
const countTween = (el: HTMLElement, duration = 1.2): gsap.core.Tween => {
  const o = { v: 0 };
  return gsap.to(o, { v: num(el.dataset['count']), duration, ease: 'power3.out', onUpdate: () => setCount(el, o.v) });
};
const cssVar = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const onEnter = (trigger: Element, play: () => void, start = 'top 65%'): void => {
  ScrollTrigger.create({ trigger, start, once: true, onEnter: play });
};

/* ---------- chrome: nav state, demo button, anchors (run under reduced motion too) ---------- */

function scrollToEl(el: HTMLElement): void {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -64 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

function initChrome(): () => void {
  const nav = one(document, '[data-nav]');
  const onScroll = (): void => {
    if (nav) nav.dataset['scrolled'] = window.scrollY > 8 ? 'true' : 'false';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const heroInput = document.querySelector<HTMLInputElement>('#demo-hero-email');
  const closeInput = document.querySelector<HTMLInputElement>('#demo-close-form-email');
  const closeSection = one(document, '#demo-close');

  const onClick = (e: Event): void => {
    const a = (e.currentTarget as HTMLAnchorElement).getAttribute('href') ?? '';
    if (e.defaultPrevented || a.length < 2 || !a.startsWith('#')) return;
    const target = a === '#top' ? document.documentElement : one(document, a);
    if (!target) return;
    e.preventDefault();
    const lenis = getLenis();
    if (a !== '#top') scrollToEl(target);
    else if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    history.replaceState(null, '', a);
  };
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  anchors.forEach((a) => a.addEventListener('click', onClick));

  const onDemo = (e: Event): void => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const r = heroInput?.getBoundingClientRect();
    const heroInView = !!r && r.bottom > 0 && r.top < window.innerHeight;
    if (heroInput && heroInView) {
      heroInput.focus();
    } else if (closeSection) {
      scrollToEl(closeSection);
      window.setTimeout(() => closeInput?.focus({ preventScroll: true }), 700);
    }
  };
  const ctas = Array.from(document.querySelectorAll<HTMLElement>('[data-demo-cta]'));
  ctas.forEach((c) => c.addEventListener('click', onDemo, true));

  return () => {
    window.removeEventListener('scroll', onScroll);
    anchors.forEach((a) => a.removeEventListener('click', onClick));
    ctas.forEach((c) => c.removeEventListener('click', onDemo, true));
  };
}

/* ---------- shared priming and playing of product panels ---------- */

function primeScores(root: HTMLElement): void {
  $(root, '[data-anim="ring-arc"]').forEach((el) => gsap.set(el, { strokeDashoffset: num(el.dataset['circ']) }));
  $(root, '[data-anim="count"]').forEach((el) => setCount(el, 0));
}

function playScores(tl: gsap.core.Timeline, root: HTMLElement, at = 0): void {
  $(root, '[data-anim="ring-arc"]').forEach((el) => tl.to(el, { strokeDashoffset: num(el.dataset['off']), duration: 1.3, ease: 'power3.out' }, at));
  $(root, '[data-anim="count"]').forEach((el) => tl.add(countTween(el, 1.3), at));
}

function primeCriteria(root: HTMLElement): void {
  gsap.set($(root, '[data-anim="criteria-row"]'), { opacity: 0.35 });
  gsap.set($(root, '[data-tick], [data-anim="criteria-row"] > span:first-child'), { scale: 0, transformOrigin: '50% 50%' });
}

function playCriteria(tl: gsap.core.Timeline, root: HTMLElement, at: number): void {
  tl.to($(root, '[data-anim="criteria-row"]'), { opacity: 1, duration: T.slow, stagger: 0.16 }, at);
  tl.to($(root, '[data-tick], [data-anim="criteria-row"] > span:first-child'), { scale: 1, duration: T.slower, stagger: 0.16, ease: 'back.out(2.2)' }, at);
}

/** A counter with a non-zero value rolls from 0 to it. */
function flipCounters(root: HTMLElement): void {
  $(root, '[data-anim="counter"]').forEach((el) => {
    const v = num(el.dataset['count']);
    if (v === 0) return;
    gsap
      .timeline()
      .to(el, { yPercent: -60, autoAlpha: 0, duration: T.fast, ease: 'power2.in' })
      .add(() => setCount(el, v))
      .fromTo(el, { yPercent: 60 }, { yPercent: 0, autoAlpha: 1, duration: T.base, ease: EASE });
  });
}

/* ---------- hero ---------- */

function initHero(root: HTMLElement): void {
  const rise = $(root, '[data-rise]');
  const stage = one(root, '[data-shot-stage]');
  const shot = one(root, '[data-shot]');
  const review = one(root, '[data-card="candidate-review"]');
  if (!stage || !shot || !review) return;

  // The H1 is never hidden. Sub-line, form and shot start hidden from CSS (.js), so there is no blink.
  primeScores(review);
  primeCriteria(review);
  gsap.set($(review, '[data-anim="event"]'), { autoAlpha: 0, y: 6 });

  // Flatten from the tilt as the page scrolls, scrubbed.
  const tilt = window.innerWidth < 640 ? 5 : 10;
  gsap.fromTo(
    shot,
    { rotateX: tilt, scale: 0.94, transformOrigin: '50% 0%' },
    {
      rotateX: 0,
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        start: 0,
        end: () => Math.max(240, stage.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.12),
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    },
  );

  // The panels come alive once: score counts, criteria tick, the integrity event appears.
  const alive = (): void => {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    playScores(tl, review, 0);
    playCriteria(tl, review, 0.35);
    tl.to($(review, '[data-anim="event"]'), { autoAlpha: 1, y: 0, duration: T.slower, stagger: 0.12 }, 1.1);
  };

  const introTl = gsap.timeline({ defaults: { ease: EASE } });
  introTl.fromTo(rise, { y: 14 }, { autoAlpha: 1, y: 0, duration: T.slower, stagger: 0.09 }, 0.05);
  introTl.fromTo(shot, { y: 28 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.2);

  if (stage.getBoundingClientRect().top < window.innerHeight * 0.9) {
    introTl.add(alive, 0.9);
  } else {
    ScrollTrigger.create({ trigger: stage, start: 'top 35%', once: true, onEnter: alive });
  }
  // Never leave the page hidden.
  window.setTimeout(() => gsap.set([...rise, shot], { autoAlpha: 1 }), 4000);
}

/* ---------- results ---------- */

function initResults(root: HTMLElement): void {
  const funnel = one(root, '[data-funnel]');
  if (!funnel) return;
  const bars = $(funnel, '[data-funnel-bar]');
  const counts = $(funnel, '[data-count]');
  const callouts = $(funnel, '[data-funnel-callout]');
  gsap.set(bars, { scaleX: 0 });
  gsap.set(callouts, { autoAlpha: 0 });
  counts.forEach((el) => setCount(el, 0));
  onEnter(funnel, () => {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    bars.forEach((b, i) => tl.to(b, { scaleX: 1, duration: 1.2, ease: 'power3.out' }, i * 0.35));
    counts.forEach((c, i) => tl.add(countTween(c, 1.2), i * 0.35));
    callouts.forEach((c, i) => tl.to(c, { autoAlpha: 1, duration: T.slower }, 1.4 + i * 0.4));
  }, 'top 70%');
}

/* ---------- product moments ---------- */

function initScreen(root: HTMLElement): void {
  const card = one(root, '[data-card="job-fit"]');
  const rows = $(root, '[data-anim="row"]');
  if (!card) return;
  primeScores(card);
  primeCriteria(card);
  const reasoning = one(card, '[data-anim="reasoning"]');
  if (reasoning) gsap.set(reasoning, { autoAlpha: 0, y: 6 });
  const perm = rows.length === 6 ? [3, 5, 1, 4, 0, 2] : rows.map((_, i) => rows.length - 1 - i);
  const offsets = (): number[] => rows.map((r, i) => (rows[perm[i] ?? i]?.offsetTop ?? r.offsetTop) - r.offsetTop);
  const start = offsets();
  rows.forEach((r, i) => gsap.set(r, { y: start[i] ?? 0 }));

  onEnter(root, () => {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    const from = offsets();
    rows.forEach((r, i) => tl.fromTo(r, { y: from[i] ?? 0 }, { y: 0, duration: 1.1 }, 0.1 + i * 0.05));
    playScores(tl, card, 0);
    playCriteria(tl, card, 0.4);
    if (reasoning) tl.to(reasoning, { autoAlpha: 1, y: 0, duration: T.slower }, 1.4);
  });
}

function initInterview(root: HTMLElement, splits: SplitText[]): void {
  const frame = one(root, '[data-card="interview-frame"]');
  const panel = one(root, '[data-card="integrity"]');
  if (!frame || !panel) return;
  const caption = one(frame, '[data-anim="caption"]');
  let words: HTMLElement[] = [];
  if (caption) {
    const split = new SplitText(caption, { type: 'words' });
    splits.push(split);
    words = split.words as HTMLElement[];
    gsap.set(words, { autoAlpha: 0 });
  }
  const events = $(panel, '[data-anim="event"]');
  gsap.set(events, { autoAlpha: 0, y: 10 });
  $(panel, '[data-anim="counter"]').forEach((el) => setCount(el, 0));

  // Voice waveform moves only while the frame is on screen.
  const bars = $(frame, '[data-anim="wave-bar"]');
  const waves = bars.map((b) =>
    gsap.to(b, { scaleY: () => gsap.utils.random(0.3, 1), duration: () => gsap.utils.random(0.28, 0.55), ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true, paused: true }),
  );
  ScrollTrigger.create({ trigger: frame, start: 'top bottom', end: 'bottom top', onToggle: (self) => waves.forEach((w) => (self.isActive ? w.play() : w.pause())) });

  onEnter(root, () => {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    if (words.length) tl.to(words, { autoAlpha: 1, duration: T.fast, stagger: 0.05, ease: 'none' }, 0.2);
    // The events exist twice (stacked list below md, track from md): time only
    // the copy on screen, and settle the hidden one so a resize shows it whole.
    const shown = events.filter((ev) => ev.offsetParent !== null);
    gsap.set(events.filter((ev) => !shown.includes(ev)), { autoAlpha: 1, y: 0 });
    shown.forEach((ev, i) => {
      const at = 0.5 + i * 0.8;
      tl.to(ev, { autoAlpha: 1, y: 0, duration: T.slower }, at);
      if (ev.dataset['flagged'] === 'true') tl.add(() => flipCounters(panel), at + 0.1);
    });
  });
}

function initDecide(root: HTMLElement): void {
  const score = one(root, '[data-card="interview-score"]');
  const board = one(root, '[data-move]');
  if (!score || !board) return;
  const card = one(board, '[data-move-card]');
  const from = one(board, '[data-col="from"]');
  const to = one(board, '[data-col="to"]');
  const stamp = one(board, '[data-stamp]');
  if (!card || !from || !to || !stamp) return;
  primeScores(score);
  const bars = $(score, '[data-anim="bar"]');
  gsap.set(bars, { scaleX: 0 });
  const dist = (): number => to.getBoundingClientRect().left - from.getBoundingClientRect().left;
  gsap.set(card, { x: -dist() });
  gsap.set(stamp, { autoAlpha: 0, y: 4 });

  onEnter(root, () => {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    playScores(tl, score, 0);
    tl.to(bars, { scaleX: 1, duration: T.slower, stagger: 0.1 }, 0.3);
    tl.fromTo(card, { x: -dist() }, { x: 0, duration: 1.1, ease: 'power3.inOut' }, 1.1);
    tl.to(stamp, { autoAlpha: 1, y: 0, duration: T.slower }, 2.1);
  });
}

/* ---------- how it works ---------- */

function initHow(root: HTMLElement): void {
  const lineX = one(root, '[data-how-line="x"]');
  const lineY = one(root, '[data-how-line="y"]');
  const steps = $(root, '[data-step]');
  if (lineX) gsap.set(lineX, { scaleX: 0 });
  if (lineY) gsap.set(lineY, { scaleY: 0 });
  gsap.set(steps, { autoAlpha: 0, y: 14 });
  onEnter(root, () => {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    if (lineX) tl.to(lineX, { scaleX: 1, duration: 2, ease: 'power2.inOut' }, 0);
    if (lineY) tl.to(lineY, { scaleY: 1, duration: 2, ease: 'power2.inOut' }, 0);
    steps.forEach((s, i) => tl.to(s, { autoAlpha: 1, y: 0, duration: T.slower + 0.1 }, i * 0.5));
  }, 'top 70%');
}

/* ---------- bento: one micro-interaction per tile ---------- */

interface Tile {
  enter: () => void;
  leave?: () => void;
}

function buildTile(key: string, tile: HTMLElement): Tile | null {
  switch (key) {
    case 'pipeline': {
      const cards = $(tile, '[data-anim="board-card"], [data-anim="moved-card"]');
      const moved = $(tile, '[data-anim="moved-card"]');
      return {
        enter: () => {
          gsap.fromTo(cards, { y: 10, autoAlpha: 0.2 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07, ease: EASE, overwrite: true });
          gsap.fromTo(moved, { x: -18 }, { x: 0, duration: 0.9, ease: EASE, overwrite: 'auto' });
        },
      };
    }
    case 'career': {
      const badge = one(tile, '[data-copied]');
      const icon = Array.from(tile.querySelectorAll<SVGElement>('[data-card="career-page"] svg')).pop();
      if (!badge) return null;
      gsap.set(badge, { autoAlpha: 0, y: 6 });
      let timer: ReturnType<typeof setTimeout> | undefined;
      return {
        enter: () => {
          clearTimeout(timer);
          if (icon) gsap.fromTo(icon, { scale: 1 }, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: '50% 50%' });
          gsap.to(badge, { autoAlpha: 1, y: 0, duration: T.slow, ease: EASE, overwrite: true });
          timer = setTimeout(() => gsap.to(badge, { autoAlpha: 0, y: 6, duration: T.slow }), 2200);
        },
      };
    }
    case 'scheduling': {
      const grid = one(tile, '[data-slot-grid]');
      const pick = one(tile, '[data-pick]');
      const selected = one(tile, '[data-slot="selected"]');
      const label = selected ? one(selected, '[data-slot-label]') : null;
      const slots = grid ? $(grid, 'li') : [];
      const other = slots.find((s) => s !== selected && s.offsetTop !== selected?.offsetTop) ?? slots.find((s) => s !== selected);
      if (!pick || !selected || !label || !other) return null;
      return {
        enter: () => {
          const a = selected.getBoundingClientRect();
          const b = other.getBoundingClientRect();
          const tl = gsap.timeline({ defaults: { ease: EASE } });
          tl.fromTo(pick, { x: b.left - a.left, y: b.top - a.top }, { x: 0, y: 0, duration: 0.9 }, 0.1);
          tl.fromTo(label, { color: cssVar('--color-text-secondary') }, { color: '#ffffff', duration: 0.3 }, 0.55);
        },
      };
    }
    case 'roles': {
      const sw = one(tile, '[data-switch="flip"]');
      const knob = sw ? one(sw, '[data-knob]') : null;
      if (!sw || !knob) return null;
      const off = cssVar('--color-gray-200');
      const on = cssVar('--color-primary');
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: EASE } })
        .fromTo(sw, { backgroundColor: off }, { backgroundColor: on, duration: T.slow }, 0)
        .fromTo(knob, { x: 0 }, { x: 12, duration: T.slow }, 0);
      return { enter: () => void tl.play(), leave: () => void tl.reverse() };
    }
    case 'email': {
      const chips = $(tile, '[data-var]');
      chips.forEach((c) => (c.dataset['name'] = c.textContent ?? ''));
      const fill = (toValue: boolean): void => {
        chips.forEach((c, i) => {
          gsap
            .timeline({ delay: i * 0.12 })
            .to(c, { opacity: 0, y: -4, duration: 0.12, ease: 'power2.in' })
            .add(() => void (c.textContent = (toValue ? c.dataset['val'] : c.dataset['name']) ?? ''))
            .to(c, { opacity: 1, y: 0, duration: T.base, ease: EASE });
        });
      };
      return { enter: () => fill(true), leave: () => fill(false) };
    }
    case 'analytics': {
      const bars = $(tile, '[data-bar]');
      return { enter: () => void gsap.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: 0.08, ease: EASE, overwrite: true }) };
    }
    default:
      return null;
  }
}

function initBento(root: HTMLElement, cleanups: (() => void)[]): void {
  const hover = window.matchMedia('(hover: hover)').matches;
  $(root, '[data-tile]').forEach((el) => {
    const t = buildTile(el.dataset['tile'] ?? '', el);
    if (!t) return;
    let on = false;
    const enter = (): void => {
      if (on) return;
      on = true;
      t.enter();
    };
    const leave = (): void => {
      if (!on) return;
      on = false;
      t.leave?.();
    };
    if (hover) {
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', leave);
      el.addEventListener('focusin', enter);
      el.addEventListener('focusout', leave);
      cleanups.push(() => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('pointerleave', leave);
        el.removeEventListener('focusin', enter);
        el.removeEventListener('focusout', leave);
      });
    } else {
      onEnter(el, () => t.enter(), 'top 75%');
    }
  });
}

/* ---------- orchestrator ---------- */

export function initV2(): void {
  onReady(() => {
    const cleanups: (() => void)[] = [initChrome()];
    if (prefersReducedMotion()) return () => cleanups.forEach((c) => c());

    const splits: SplitText[] = [];
    const ctx = gsap.context(() => {
      const hero = one(document, '[data-hero]');
      if (hero) initHero(hero);
      const results = one(document, '#results');
      if (results) initResults(results);
      const screen = one(document, '[data-feature="screen"]');
      if (screen) initScreen(screen);
      const interview = one(document, '[data-feature="interview"]');
      if (interview) initInterview(interview, splits);
      const decide = one(document, '[data-feature="decide"]');
      if (decide) initDecide(decide);
      const how = one(document, '[data-how]');
      if (how) initHow(how);
      const bento = one(document, '[data-bento]');
      if (bento) initBento(bento, cleanups);
    });

    const refresh = (): void => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    void document.fonts.ready.then(refresh);
    return () => {
      cleanups.forEach((c) => c());
      splits.forEach((s) => s.revert());
      ctx.revert();
    };
  });
}
