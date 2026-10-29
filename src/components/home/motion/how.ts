/**
 * How it works. Desktop: the section pins and the nine steps slide past on a horizontal track,
 * scrubbed to scroll; each step's vignette is a slice of that same timeline, so it plays in
 * proportion to scroll and reverses with it. Phones: a vertical list whose vignettes play once on entry.
 * Nothing here reacts to the pointer or keyboard.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { $, EASE, navH, num, one } from './util';

/** One vignette's animation, 0..1 long. Elements are looked up by data-v, or by the shared cards' own data-anim hooks. */
function vignette(i: number, el: HTMLElement, paused: boolean): gsap.core.Timeline {
  const tl = gsap.timeline({ paused, defaults: { ease: 'power2.out' } });
  const all = (k: string): HTMLElement[] => $(el, `[data-v="${k}"]`);
  const anim = (k: string): HTMLElement[] => $(el, `[data-anim="${k}"]`);
  const first = (k: string): HTMLElement | null => one(el, `[data-v="${k}"]`);

  if (i === 0) {
    // The draft writes itself in, line by line.
    tl.fromTo(anim('draft-line'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.18 }, 0.1);
  } else if (i === 1) {
    tl.fromTo(anim('row'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.15, ease: EASE }, 0.05);
  } else if (i === 2) {
    // The Apply button presses, then the applications land in the list.
    tl.fromTo(all('apply').slice(0, 1), { scale: 1 }, { scale: 0.86, duration: 0.08, yoyo: true, repeat: 1 }, 0.05);
    tl.fromTo(all('applied'), { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.2, ease: EASE }, 0.25);
  } else if (i === 3) {
    // What matches, what is missing, and the reasoning.
    tl.fromTo(anim('criteria-row'), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.2, stagger: 0.12 }, 0.05);
    tl.fromTo(anim('reasoning'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.6);
  } else if (i === 4) {
    tl.fromTo(anim('row'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.15, ease: EASE }, 0.05);
  } else if (i === 5) {
    // Pick a slot, then the booking confirms.
    tl.fromTo(anim('slot'), { opacity: 0.4 }, { opacity: 1, duration: 0.2, stagger: 0.08 }, 0.05);
    tl.fromTo(anim('toast'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 }, 0.6);
  } else if (i === 6) {
    const count = one(el, '[data-anim="count"]');
    if (count) {
      const o = { v: 0 };
      tl.fromTo(o, { v: 0 }, { v: num(count.dataset['count']), duration: 0.5, onUpdate: () => void (count.textContent = String(Math.round(o.v))) }, 0.05);
    }
    tl.fromTo(anim('bar'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, stagger: 0.1 }, 0.3);
  } else if (i === 7) {
    // Amara moves from Completed to HR Round, and the stamp lands.
    const card = first('card');
    const from = first('from');
    const to = first('to');
    const stamp = first('stamp');
    if (card && from && to) {
      const dist = (): number => to.getBoundingClientRect().left - from.getBoundingClientRect().left;
      tl.fromTo(card, { x: () => -dist() }, { x: 0, duration: 0.5, ease: 'power3.inOut', immediateRender: true }, 0.2);
      if (stamp) tl.fromTo(stamp, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2 }, 0.74);
    }
  } else {
    // The Offer button presses, and the stage chip changes to Offered.
    tl.fromTo(all('offer'), { scale: 1 }, { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1 }, 0.15);
    tl.fromTo(all('stage-from'), { opacity: 1 }, { opacity: 0, duration: 0.15 }, 0.45);
    tl.fromTo(all('stage-to'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.2 }, 0.45);
    tl.fromTo(all('stamp'), { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2 }, 0.65);
  }
  return tl;
}

/** Mark one step as the active one. */
function setActive(root: HTMLElement, i: number): void {
  $(root, '[data-step]').forEach((s, k) => {
    s.dataset['active'] = k === i ? 'true' : 'false';
  });
  // The progress rail fills up to the active step.
  $(root, '[data-how-dot]').forEach((d, k) => void (d.dataset['on'] = k <= i ? 'true' : 'false'));
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
  setActive(root, 0);
  progress.hidden = false;
  const dist = (): number => (n - 1) * viewport.clientWidth;

  const master = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: () => `top ${navH()}px`,
      // About a third of a screen of scroll per step, so nine steps stay under four screens.
      end: () => `+=${Math.round(Math.min(n * window.innerHeight * 0.36, window.innerHeight * 3.6))}`,
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      refreshPriority: 1,
      invalidateOnRefresh: true,
    },
    onUpdate: () => {
      setActive(root, Math.min(n - 1, Math.max(0, Math.round(master.time() - 0.5))));
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

export function initHowSimple(root: HTMLElement): () => void {
  const triggers: ScrollTrigger[] = [];
  $(root, '[data-step]').forEach((step, i) => {
    const v = one(step, '[data-vignette]');
    if (!v) return;
    const vt = vignette(i, v, true);
    triggers.push(
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          step.dataset['active'] = 'true';
          vt.duration(1.4).play();
        },
      }),
    );
  });
  return () => triggers.forEach((t) => t.kill());
}
