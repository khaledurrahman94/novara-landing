/**
 * How it works. Desktop: the section pins and the nine steps slide past on a horizontal track,
 * scrubbed to scroll and snapped step by step: each step settles on screen with its vignette finished and holds
 * before the next one moves in. Each vignette is a slice of that same timeline, so it reverses with scroll.
 * Phones: a vertical list whose vignettes play once on entry.
 * Each step title is a button: it scrolls the pinned track to that step (or replays the vignette in the list).
 */
import { gsap, ScrollTrigger, getLenis } from '../../../scripts/motion';
import { $, EASE, navH, num, one } from './util';
import { createGhost, type Ghost } from './ghost';

/** Ghost pointers created for the vignettes, removed on cleanup. */
const pointers: Ghost[] = [];
const clearPointers = (): void => void pointers.splice(0).forEach((g) => g.destroy());

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
    // A candidate presses Apply, then the applications land in the list.
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
    // A pointer picks Amara up from Completed, drops her in HR Round, and the stamp lands.
    const card = first('card');
    const from = first('from');
    const to = first('to');
    const stamp = first('stamp');
    if (card && from && to) {
      const dist = (): number => to.getBoundingClientRect().left - from.getBoundingClientRect().left;
      const g = createGhost(el);
      pointers.push(g);
      // Where the card rests when dropped, in the vignette's own coordinates.
      const rest = (): { x: number; y: number } => {
        const r = card.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        return { x: r.left - b.left + r.width / 2 - num(String(gsap.getProperty(card, 'x'))), y: r.top - b.top + r.height / 2 };
      };
      const sx = (): number => rest().x - dist();
      const sy = (): number => rest().y;
      tl.fromTo(g.el, { x: () => sx() + 56, y: () => sy() + 44, opacity: 0 }, { x: sx, y: sy, opacity: 0.85, duration: 0.22, ease: 'power3.out' }, 0);
      tl.to(g.el, { scale: 0.85, duration: 0.06 }, 0.24);
      tl.fromTo(card, { x: () => -dist() }, { x: 0, duration: 0.4, ease: 'power3.inOut', immediateRender: true }, 0.3);
      tl.fromTo(g.el, { x: sx }, { x: () => rest().x, duration: 0.4, ease: 'power3.inOut', immediateRender: false }, 0.3);
      tl.to(g.el, { scale: 1, duration: 0.06 }, 0.72);
      tl.to(g.el, { opacity: 0, duration: 0.15 }, 0.82);
      if (stamp) tl.fromTo(stamp, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2 }, 0.74);
    }
  } else {
    // The recruiter presses Offer, and the stage chip changes to Offered.
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
    const b = one(s, '[data-step-btn]');
    if (k === i) b?.setAttribute('aria-current', 'step');
    else b?.removeAttribute('aria-current');
  });
  // The progress rail fills up to the active step.
  $(root, '[data-how-dot]').forEach((d, k) => void (d.dataset['on'] = k <= i ? 'true' : 'false'));
}

/** Every step is a button. Clicking one makes it active, and the mode-specific handler does the rest. */
export function initHowSteps(root: HTMLElement, onPick?: (i: number) => void): () => void {
  setActive(root, 0);
  const cleanups = $(root, '[data-step]').map((step, i) => {
    const b = one(step, '[data-step-btn]');
    if (!b) return () => undefined;
    const on = (): void => {
      setActive(root, i);
      onPick?.(i);
    };
    b.addEventListener('click', on);
    return () => b.removeEventListener('click', on);
  });
  return () => cleanups.forEach((c) => c());
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
  const width = (): number => viewport.clientWidth;

  // Timeline units: step i settles at HOLD + i, with HOLD of rest at each end. Each slot is one unit long:
  // the track moves and the vignette plays in its last ~0.6, then the step holds still so it can be read.
  const HOLD = 0.5;
  const total = n - 1 + 2 * HOLD;
  const settle = (i: number): number => HOLD + i;
  // Snap points are the nine settled steps, plus both ends so the visitor can always scroll out of the pin.
  const points = [0, ...steps.map((_, i) => settle(i) / total), 1];
  // Roughly one screen of scroll per step on desktop, a little less on tablets.
  const perUnit = (): number => window.innerHeight * (window.innerWidth >= 1024 ? 0.9 : 0.7);

  const master = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: () => `top ${navH()}px`,
      end: () => `+=${Math.round(total * perUnit())}`,
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      refreshPriority: 1,
      invalidateOnRefresh: true,
      // Settle on a step after the wheel or touch stops. Directional, so a small scroll moves to the next step
      // instead of falling back. Runs after Lenis has finished easing: ScrollTrigger only starts the snap once
      // scroll updates (fed from Lenis' scroll event) stop, and Lenis re-syncs to the native position then.
      snap: { snapTo: points, duration: { min: 0.4, max: 0.6 }, delay: 0.08, ease: 'power2.inOut', directional: true, inertia: false },
    },
    onUpdate: () => {
      setActive(root, Math.min(n - 1, Math.max(0, Math.round(master.time() - HOLD))));
    },
  });
  steps.forEach((step, i) => {
    const v = one(step, '[data-vignette]');
    if (v) {
      const vt = vignette(i, v, false);
      // Step 0 plays in the lead-in; the others finish just before their step settles.
      vt.duration(i === 0 ? 0.4 : 0.5);
      master.add(vt, i === 0 ? 0.05 : settle(i) - 0.55);
    }
    if (i === 0) return;
    const at = settle(i) - 0.6;
    master.fromTo(track, { x: () => -(i - 1) * width() }, { x: () => -i * width(), duration: 0.45, ease: 'power2.inOut', immediateRender: i === 1 }, at);
    master.fromTo(line, { scaleX: (i - 1) / (n - 1) }, { scaleX: i / (n - 1), duration: 0.45, ease: 'power2.inOut', immediateRender: i === 1 }, at);
  });
  master.to({}, { duration: HOLD }, settle(n - 1));

  // Click or focus a step: scroll the pinned track to it.
  const goTo = (i: number): void => {
    const st = master.scrollTrigger;
    if (!st) return;
    const y = st.start + (settle(i) / total) * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };
  const btnCleanups = steps.map((step, i) => {
    const b = one(step, '[data-step-btn]');
    if (!b) return () => undefined;
    const click = (): void => goTo(i);
    // Focus must not slide the clipped track out of step.
    const focus = (): void => {
      viewport.scrollLeft = 0;
      goTo(i);
    };
    b.addEventListener('click', click);
    b.addEventListener('focus', focus);
    return () => {
      b.removeEventListener('click', click);
      b.removeEventListener('focus', focus);
    };
  });

  return () => {
    btnCleanups.forEach((c) => c());
    clearPointers();
    root.classList.remove('is-h');
    progress.hidden = true;
    master.scrollTrigger?.kill();
    master.kill();
    gsap.set([track, line], { clearProps: 'transform' });
  };
}

const replays: Record<number, () => void> = {};
/** Vertical list: picking a step replays its vignette. */
export const replayStep = (i: number): void => replays[i]?.();

export function initHowSimple(root: HTMLElement): () => void {
  const triggers: ScrollTrigger[] = [];
  $(root, '[data-step]').forEach((step, i) => {
    const v = one(step, '[data-vignette]');
    if (!v) return;
    const vt = vignette(i, v, true);
    replays[i] = () => void vt.duration(1.4).restart();
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
  return () => {
    triggers.forEach((t) => t.kill());
    clearPointers();
    Object.keys(replays).forEach((k) => delete replays[Number(k)]);
  };
}
