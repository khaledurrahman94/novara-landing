/**
 * Hero: the candidate-review screen starts exploded into depth layers with evidence chips around it.
 * Scrolling reassembles it (scrubbed, so it explodes again on the way back); the chips dock onto the
 * values they describe and fade into them. The cursor moves every layer by its depth (see interaction.ts).
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { setStrength } from './interaction';
import { $, EASE, num, one } from './util';

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
  const W = (): number => stage.clientWidth;

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: {
      start: 0,
      end: () => Math.max(320, docTop(stage) - window.innerHeight * 0.2),
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
    onUpdate: () => setStrength(stage, Math.pow(1 - tl.progress(), 1.4)),
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
