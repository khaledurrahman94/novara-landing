/**
 * Hero: the candidate-review screen starts exploded into depth layers with evidence chips around it.
 * Scrolling reassembles it (scrubbed, so it explodes again on the way back); the chips dock onto the
 * values they describe and fade into them. The scrub ends where the horizon gradient meets the bottom of the sticky
 * nav, and a snap resolves every scroll stop in that range to one of two states: top, or settled there.
 */
import { gsap } from '../../../scripts/motion';
import { $, EASE, navH, num, one } from './util';

const docTop = (el: HTMLElement): number => {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
};

const parse = (el: HTMLElement): number[] => (el.dataset['ex'] ?? '').split(',').map((v) => num(v));

export function initHero(root: HTMLElement): void {
  const stage = one(root, '[data-hero-stage]');
  const frame = one(root, '[data-frame]');
  if (!stage || !frame) return;
  const rise = $(root, '[data-rise]');
  const layers = $(stage, '[data-layer]');
  const chips = $(stage, '[data-chip]');
  const edges = $(stage, '[data-edge]');
  const horizon = one(stage, '.home-horizon');
  const W = (): number => stage.clientWidth;
  /** Scroll position where the horizon's top edge sits flush under the sticky nav (the settled state). */
  const settled = (): number => Math.max(200, Math.round(docTop(horizon ?? stage) - navH()));

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: {
      start: 0,
      end: settled,
      scrub: 0.6,
      invalidateOnRefresh: true,
      // Magnetic settle between the two resting states (progress 0 = top, 1 = settled). Same setup as How and
      // Audience: directional so a small scroll still commits, no inertia. Past the end the trigger is inactive,
      // so scrolling on into the next section is never snapped back.
      snap: { snapTo: [0, 1], duration: { min: 0.4, max: 0.6 }, delay: 0.08, ease: 'power2.inOut', directional: true, inertia: false },
    },
  });

  const [ff = 0, fy = 0, fs = 1] = parse(frame);
  tl.fromTo(frame, { x: () => ff * W(), y: () => fy * W(), scale: fs }, { x: 0, y: 0, scale: 1 }, 0);

  layers.forEach((el) => {
    const [x = 0, y = 0, s = 1, r = 0] = parse(el);
    tl.fromTo(el, { x: () => x * W(), y: () => y * W(), scale: s, rotation: r }, { x: 0, y: 0, scale: 1, rotation: 0 }, 0);
  });
  tl.fromTo(edges, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'none' }, 0.7);

  chips.forEach((el) => {
    const [x = 0, y = 0] = parse(el);
    tl.fromTo(el, { x: () => x * W(), y: () => y * W(), scale: 1.12 }, { x: 0, y: 0, scale: 0.9 }, 0);
    tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'none' }, 0.8);
  });

  // Intro: text rises, then the exploded stage settles in. The H1 is never hidden.
  const intro = gsap.timeline({ defaults: { ease: EASE } });
  intro.fromTo(rise, { y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09 }, 0.05);
  intro.fromTo(stage, { y: 28 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.2);
  window.setTimeout(() => gsap.set([...rise, stage], { autoAlpha: 1 }), 4000);
}
