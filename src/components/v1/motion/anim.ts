/**
 * V1 motion grammar. One entrance for every mockup: rise 10px and fade in, expo.out, 60-80ms stagger.
 * Initial hidden states are set from JS (prime*), so no-JS and reduced-motion users see the end state.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Mirrors --duration-* tokens (seconds). */
export const T = { fast: 0.15, base: 0.25, slow: 0.4, slower: 0.7 } as const;
export const EASE = 'expo.out';

export const $$ = (root: ParentNode, sel: string): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(sel));

export function setCount(el: HTMLElement, v: number): void {
  el.textContent = Math.round(v).toLocaleString('en-US') + (el.dataset['suffix'] ?? '');
}

const num = (v: string | undefined, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** Counting tween for any [data-count] element. */
export function countTween(el: HTMLElement, duration = 1.2): gsap.core.Tween {
  const o = { v: 0 };
  return gsap.to(o, { v: num(el.dataset['count']), duration, ease: 'power3.out', onUpdate: () => setCount(el, o.v) });
}

const RISE = '[data-anim="criteria-row"],[data-anim="row"],[data-anim="board-card"],[data-anim="draft-line"],[data-anim="slot"]';

interface Primed {
  reasoning: SplitText | null;
  caption: SplitText | null;
}
const primed = new WeakMap<HTMLElement, Primed>();

/** Hide a mockup's animated parts. Call once from JS before the mockup scrolls in. */
export function primeMockup(root: HTMLElement, opts: { integrity?: boolean } = {}): void {
  delete root.dataset['played'];
  gsap.set($$(root, RISE), { autoAlpha: 0, y: 10 });
  gsap.set($$(root, '[data-anim="moved-card"]'), { autoAlpha: 0, x: -14 });
  gsap.set($$(root, '[data-anim="bar"]'), { scaleX: 0 });
  gsap.set($$(root, '[data-anim="stage-bar"]'), { scaleY: 0 });
  gsap.set($$(root, '[data-anim="bar-value"]'), { autoAlpha: 0, y: 6 });
  gsap.set($$(root, '[data-anim="toast"]'), { autoAlpha: 0, y: 12 });
  $$(root, '[data-anim="count"]').forEach((el) => setCount(el, 0));
  $$(root, '[data-anim="ring-arc"]').forEach((el) => gsap.set(el, { strokeDashoffset: num(el.dataset['circ']) }));

  const entry: Primed = { reasoning: null, caption: null };
  const reasoning = root.querySelector<HTMLElement>('[data-anim="reasoning"]');
  if (reasoning) {
    entry.reasoning = new SplitText(reasoning, { type: 'lines' });
    gsap.set(entry.reasoning.lines, { autoAlpha: 0, y: 6 });
  }
  const caption = root.querySelector<HTMLElement>('[data-anim="caption"]');
  if (caption) {
    entry.caption = new SplitText(caption, { type: 'words' });
    gsap.set(entry.caption.words, { autoAlpha: 0 });
  }
  if (!opts.integrity) {
    gsap.set($$(root, '[data-anim="event"]'), { autoAlpha: 0, y: 10 });
    $$(root, '[data-anim="counter"]').forEach((el) => setCount(el, 0));
  }
  primed.set(root, entry);
}

/** Play a primed mockup once. Returns the timeline. Safe to call again: it only plays the first time. */
export function playMockup(root: HTMLElement, delay = 0): gsap.core.Timeline {
  const tl = gsap.timeline({ delay, defaults: { ease: EASE } });
  if (root.dataset['played'] === 'true') return tl;
  root.dataset['played'] = 'true';
  const p = primed.get(root);

  const rise = $$(root, RISE);
  if (rise.length) tl.to(rise, { autoAlpha: 1, y: 0, duration: T.slower, stagger: 0.07 }, 0);
  const moved = $$(root, '[data-anim="moved-card"]');
  if (moved.length) tl.to(moved, { autoAlpha: 1, x: 0, duration: T.slower }, 0.45);

  $$(root, '[data-anim="ring-arc"]').forEach((el) =>
    tl.to(el, { strokeDashoffset: num(el.dataset['off']), duration: 1.2, ease: 'power3.out' }, 0),
  );
  $$(root, '[data-anim="count"]').forEach((el) => tl.add(countTween(el), 0));

  const bars = $$(root, '[data-anim="bar"]');
  if (bars.length) tl.to(bars, { scaleX: 1, duration: T.slower, stagger: 0.1 }, 0.25);
  const stageBars = $$(root, '[data-anim="stage-bar"]');
  if (stageBars.length) {
    tl.to(stageBars, { scaleY: 1, duration: 1, stagger: 0.12 }, 0.1);
    tl.to($$(root, '[data-anim="bar-value"]'), { autoAlpha: 1, y: 0, duration: T.slower, stagger: 0.12 }, 0.3);
  }

  if (p?.reasoning) tl.to(p.reasoning.lines, { autoAlpha: 1, y: 0, duration: T.slower, stagger: 0.09 }, 0.5);
  if (p?.caption) tl.to(p.caption.words, { autoAlpha: 1, duration: T.fast, stagger: 0.045, ease: 'none' }, 0.4);

  // Integrity: events in order; the focus counter flips when its event appears.
  const events = $$(root, '[data-anim="event"]');
  events.forEach((ev, i) => {
    const at = 0.3 + i * 0.45;
    tl.to(ev, { autoAlpha: 1, y: 0, duration: T.slower }, at);
    if (ev.dataset['flagged'] === 'true') tl.add(() => flipCounters(root), at + 0.1);
  });
  if (events.length) {
    $$(root, '[data-anim="counter"]').forEach((el) => {
      if (num(el.dataset['count']) === 0) setCount(el, 0);
    });
  }

  const toast = $$(root, '[data-anim="toast"]');
  if (toast.length) tl.to(toast, { autoAlpha: 1, y: 0, duration: T.slower }, 1.1);
  return tl;
}

/** Counters with a non-zero value flip 0 to value (a quick roll). */
export function flipCounters(root: HTMLElement): void {
  $$(root, '[data-anim="counter"]').forEach((el) => {
    const v = num(el.dataset['count']);
    if (v === 0) return;
    gsap
      .timeline()
      .to(el, { yPercent: -60, autoAlpha: 0, duration: T.fast, ease: 'power2.in' })
      .add(() => setCount(el, v))
      .fromTo(el, { yPercent: 60 }, { yPercent: 0, autoAlpha: 1, duration: T.base, ease: EASE });
  });
}

/** Voice waveform: bars move only while the frame is on screen. */
export function waveWhileVisible(frame: HTMLElement): void {
  const bars = $$(frame, '[data-anim="wave-bar"]');
  if (!bars.length) return;
  const tweens = bars.map((b) =>
    gsap.to(b, {
      scaleY: () => gsap.utils.random(0.3, 1),
      duration: () => gsap.utils.random(0.28, 0.55),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
      paused: true,
    }),
  );
  ScrollTrigger.create({
    trigger: frame,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.play() : t.pause())),
  });
}

/** Inner panel drifts at about 0.9x the frame while it passes. */
export function plateDepth(scope: ParentNode): void {
  const amp = window.innerWidth < 640 ? 8 : 20;
  $$(scope, '[data-plate]').forEach((plate) => {
    const inner = plate.querySelector<HTMLElement>('[data-anim="plate-inner"]');
    if (!inner) return;
    gsap.fromTo(
      inner,
      { y: amp },
      { y: -amp, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

/** Enter a primed mockup when it scrolls into view. */
export function playOnEnter(root: HTMLElement, trigger: HTMLElement = root, start = 'top 78%'): void {
  ScrollTrigger.create({ trigger, start, once: true, onEnter: () => void playMockup(root) });
}

/** Scale a mockup down (never up) so it fits its plate. */
export function fitInto(box: HTMLElement, content: HTMLElement): void {
  gsap.set(content, { scale: 1, transformOrigin: '50% 50%' });
  const cs = getComputedStyle(box);
  const w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const s = Math.min(1, w / content.offsetWidth, h / content.offsetHeight);
  gsap.set(content, { scale: s });
}
