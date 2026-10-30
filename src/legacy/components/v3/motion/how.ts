/**
 * How it works. Desktop: the section pins and the four steps slide past on a horizontal track,
 * scrubbed to scroll; each step's vignette is a slice of that same timeline, so it plays in
 * proportion to scroll and reverses with it. Phones: a vertical list whose vignettes play once on entry.
 */
import { gsap, ScrollTrigger, getLenis } from '../../../scripts/motion';
import { $, EASE, navH, num, one } from './util';
import { createGhost, type Ghost } from './ghost';
import { fitScale } from './fit';

/** Loops that run only while their step is active and on screen (the interview waveform). */
const loops = new Map<number, gsap.core.Animation>();
/** Ghost pointers created for the vignettes, removed on cleanup. */
const pointers: Ghost[] = [];
const syncLoops = (active: number | null): void => loops.forEach((a, i) => (i === active ? a.play() : a.pause()));
const clearLoops = (): void => {
  loops.forEach((a) => a.kill());
  loops.clear();
  pointers.splice(0).forEach((g) => g.destroy());
};

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
    // A candidate presses Apply, then the applications land in the list.
    tl.fromTo(all('apply').slice(0, 1), { scale: 1 }, { scale: 0.86, duration: 0.08, yoyo: true, repeat: 1 }, 0.05);
    tl.fromTo(all('applied'), { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.2, ease: EASE }, 0.25);
  } else if (i === 2) {
    all('fit-num').forEach((n, k) => {
      const o = { v: 0 };
      tl.fromTo(o, { v: 0 }, { v: num(n.dataset['count']), duration: 0.5, ease: 'power2.out', onUpdate: () => void (n.textContent = String(Math.round(o.v))) }, 0.05 + k * 0.1);
    });
    tl.fromTo(all('fit-bar'), { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, 0.05);
    tl.fromTo(all('qualified'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.15 }, 0.55);
    tl.fromTo(all('interview'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.15 }, 0.6);
    tl.fromTo(all('wave'), { opacity: 0, scaleY: 0.2 }, { opacity: 1, scaleY: 1, duration: 0.15, stagger: 0.015 }, 0.68);
    // Captions appear word by word, as in the live interview.
    tl.fromTo(all('cap'), { opacity: 0 }, { opacity: 1, duration: 0.05, stagger: 0.28 / Math.max(1, all('cap').length), ease: 'none' }, 0.72);
    // While this step is active the waveform keeps moving, bar by bar.
    const bars = all('wave');
    if (bars.length) {
      const lp = gsap.timeline({ paused: true, repeat: -1 });
      bars.forEach((b, k) => lp.fromTo(b, { scaleY: 1 }, { scaleY: 0.3 + ((k * 37) % 5) * 0.1, duration: 0.35 + (k % 3) * 0.1, ease: 'sine.inOut', yoyo: true, repeat: 3 }, k * 0.06));
      loops.set(i, lp);
    }
  } else {
    // A pointer picks Amara up from Completed, drops her in HR Round, and the stamp lands.
    const card = first('card');
    const from = first('from');
    const to = first('to');
    const stamp = first('stamp');
    if (card && from && to) {
      // The visual is scaled to fit its frame: screen distances are divided by the scale to get the card's own units.
      const k = (): number => fitScale(el);
      const dist = (): number => to.getBoundingClientRect().left - from.getBoundingClientRect().left;
      const g = createGhost(el);
      pointers.push(g);
      // Where the card rests when dropped, in the vignette's own coordinates.
      const rest = (): { x: number; y: number } => {
        const r = card.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        return { x: r.left - b.left + r.width / 2 - num(String(gsap.getProperty(card, 'x'))) * k(), y: r.top - b.top + r.height / 2 };
      };
      const sx = (): number => rest().x - dist();
      const sy = (): number => rest().y;
      tl.fromTo(g.el, { x: () => sx() + 56, y: () => sy() + 44, opacity: 0 }, { x: sx, y: sy, opacity: 0.85, duration: 0.22, ease: 'power3.out' }, 0);
      tl.to(g.el, { scale: 0.85, duration: 0.06 }, 0.24);
      tl.fromTo(card, { x: () => -dist() / k() }, { x: 0, duration: 0.4, ease: 'power3.inOut', immediateRender: true }, 0.3);
      tl.fromTo(g.el, { x: sx }, { x: () => rest().x, duration: 0.4, ease: 'power3.inOut', immediateRender: false }, 0.3);
      tl.to(g.el, { scale: 1, duration: 0.06 }, 0.72);
      tl.to(g.el, { opacity: 0, duration: 0.15 }, 0.82);
      if (stamp) tl.fromTo(stamp, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2 }, 0.74);
    }
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
  let current = 0;
  root.classList.add('is-h');
  progress.hidden = false;
  const dist = (): number => (n - 1) * viewport.clientWidth;

  const master = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: () => `top ${navH()}px`,
      // Modest: the track needs only about 2.5 screens of scroll.
      end: () => `+=${Math.round(Math.min(dist() * 0.45 + 200, window.innerHeight * 3))}`,
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      refreshPriority: 1,
      invalidateOnRefresh: true,
      onToggle: (self) => syncLoops(self.isActive ? current : null),
    },
    onUpdate: () => {
      current = Math.min(n - 1, Math.max(0, Math.round(master.time() - 0.5)));
      setActive(root, current);
      if (master.scrollTrigger?.isActive) syncLoops(current);
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

  // Click or focus a step: scroll the pinned track to it.
  const goTo = (i: number): void => {
    const st = master.scrollTrigger;
    if (!st) return;
    const y = st.start + ((HOLD + i) / n) * (st.end - st.start);
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
    clearLoops();
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
    triggers.push(ScrollTrigger.create({ trigger: step, start: 'top 75%', once: true, onEnter: () => void vt.duration(1.4).play() }));
    // Loops run only while their step is on screen.
    triggers.push(
      ScrollTrigger.create({ trigger: step, start: 'top 85%', end: 'bottom 15%', onToggle: (self) => void (self.isActive ? loops.get(i)?.play() : loops.get(i)?.pause()) }),
    );
  });
  return () => {
    triggers.forEach((t) => t.kill());
    clearLoops();
    Object.keys(replays).forEach((k) => delete replays[Number(k)]);
  };
}
