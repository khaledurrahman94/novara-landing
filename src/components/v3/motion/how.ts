/**
 * How it works. Desktop: the section pins and the four steps slide past on a horizontal track,
 * scrubbed to scroll; each step's vignette is a slice of that same timeline, so it plays in
 * proportion to scroll and reverses with it. Phones: a vertical list whose vignettes play once on entry.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { $, EASE, num, one } from './util';

/** One vignette's animation, 0..1 long. Elements are looked up by data-v. */
function vignette(i: number, el: HTMLElement, paused: boolean): gsap.core.Timeline {
  const tl = gsap.timeline({ paused, defaults: { ease: 'power2.out' } });
  const all = (k: string): HTMLElement[] => $(el, `[data-v="${k}"]`);
  const first = (k: string): HTMLElement | null => one(el, `[data-v="${k}"]`);

  if (i === 0) {
    tl.fromTo(all('chip'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.15 }, 0);
    tl.fromTo(all('title'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.15 }, 0.05);
    tl.fromTo(all('skill'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.12, stagger: 0.05 }, 0.15);
    // The description writes itself in, word by word.
    tl.fromTo(all('word'), { opacity: 0.1 }, { opacity: 1, duration: 0.05, stagger: 0.7 / Math.max(1, all('word').length), ease: 'none' }, 0.3);
  } else if (i === 1) {
    tl.fromTo(all('applied'), { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.2, ease: EASE }, 0.15);
  } else if (i === 2) {
    all('fit-num').forEach((n, k) => {
      const o = { v: 0 };
      tl.fromTo(o, { v: 0 }, { v: num(n.dataset['count']), duration: 0.6, ease: 'power2.out', onUpdate: () => void (n.textContent = String(Math.round(o.v))) }, 0.05 + k * 0.1);
    });
    tl.fromTo(all('fit-bar'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.05);
    tl.fromTo(all('interview'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.2 }, 0.75);
  } else {
    const card = first('card');
    const from = first('from');
    const to = first('to');
    const stamp = first('stamp');
    const btn = first('btn');
    if (card && from && to) {
      const dist = (): number => to.getBoundingClientRect().left - from.getBoundingClientRect().left;
      if (btn) tl.fromTo(btn, { scale: 1 }, { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 }, 0);
      tl.fromTo(card, { x: () => -dist() }, { x: 0, duration: 0.5, ease: 'power3.inOut' }, 0.2);
      if (stamp) tl.fromTo(stamp, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2 }, 0.75);
    }
  }
  return tl;
}

export function initHowPinned(root: HTMLElement): (() => void) | void {
  const viewport = one(root, '[data-how-viewport]');
  const track = one(root, '[data-how-track]');
  const progress = one(root, '[data-how-progress]');
  const line = one(root, '[data-how-line]');
  const steps = $(root, '[data-step]');
  if (!viewport || !track || !progress || !line || steps.length < 2) return;

  const n = steps.length;
  root.classList.add('is-h');
  progress.hidden = false;
  const dist = (): number => (n - 1) * viewport.clientWidth;

  const master = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top 64px',
      end: () => `+=${Math.round(dist() * 1.25 + 240)}`,
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  // Slide i is centred at time HOLD + i. A short hold at each end lets the first and last steps rest.
  const HOLD = 0.5;
  master.to(track, { x: () => -dist(), duration: n - 1 }, HOLD);
  master.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: n - 1 }, HOLD);
  steps.forEach((step, i) => {
    const v = one(step, '[data-vignette]');
    if (!v) return;
    const vt = vignette(i, v, false);
    const len = i === 0 ? 0.45 : 0.7;
    const at = i === 0 ? 0 : Math.max(0, HOLD + i - 0.85);
    vt.duration(len);
    master.add(vt, at);
  });
  master.to({}, { duration: HOLD }, HOLD + n - 1);

  return () => {
    root.classList.remove('is-h');
    progress.hidden = true;
    master.scrollTrigger?.kill();
    master.kill();
    gsap.set([track, line], { clearProps: 'transform' });
  };
}

export function initHowSimple(root: HTMLElement): void {
  $(root, '[data-step]').forEach((step, i) => {
    const v = one(step, '[data-vignette]');
    if (!v) return;
    const vt = vignette(i, v, true);
    ScrollTrigger.create({ trigger: step, start: 'top 75%', once: true, onEnter: () => void vt.duration(1.4).play() });
  });
}
