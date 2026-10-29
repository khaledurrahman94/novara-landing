/**
 * Hero: the candidate-review screen starts exploded into depth layers with evidence chips around it.
 * Scrolling reassembles it (scrubbed, so it explodes again on the way back); the chips dock onto the
 * values they describe and fade into them. Scroll drives it; nothing follows the pointer.
 * The Job Fit card beside the headline is triggered, not scrubbed: it plays once on entry, then idles.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
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

/**
 * The Job Fit card beside the headline. Ambient only (no pointer input): it builds itself once when it
 * first scrolls in (ring and count, ticks, the missing row, the reasoning), then floats a few px and
 * quietly replays the ring shimmer and the ticks. The loops pause whenever the card is off screen.
 * Everything animates transform, opacity or clip-path, so nothing moves the layout.
 */
function initHeroCard(root: HTMLElement): void {
  const card = one(root, '[data-hero-card]');
  const float = one(root, '[data-hero-float]');
  if (!card || !float) return;
  const q = (k: string): HTMLElement[] => $(card, `[data-anim="${k}"]`);
  const heads = q('criteria-head');
  const rows = q('criteria-row');
  const matched = rows.filter((r) => r.dataset['state'] === 'match');
  const missing = rows.filter((r) => r.dataset['state'] === 'miss');
  const ticks = matched.map((r) => r.querySelector<SVGPathElement>('svg path')).filter((p): p is SVGPathElement => !!p);
  const lens = ticks.map((p) => p.getTotalLength());
  const alerts = missing.map((r) => one(r, 'svg')).filter((e): e is HTMLElement => !!e);
  const arc = card.querySelector<SVGCircleElement>('[data-anim="ring-arc"]');
  const count = one(card, '[data-anim="count"]');
  const shimmer = q('shimmer');
  const why = q('why');
  const reasoning = q('reasoning');
  const circ = num(arc?.dataset['circ']);
  const off = num(arc?.dataset['off']);
  const target = num(count?.dataset['count']);
  const num0 = { v: 0 };

  // Hidden start states (the CSS already hides the card wrapper until the entrance).
  gsap.set(card, { autoAlpha: 0, y: 24 });
  gsap.set(heads, { autoAlpha: 0 });
  gsap.set(rows, { autoAlpha: 0, x: -8 });
  gsap.set(why, { autoAlpha: 0, y: 10 });
  gsap.set(reasoning, { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' });
  if (arc) gsap.set(arc, { strokeDashoffset: circ });
  if (count) count.textContent = '0';
  ticks.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i] ?? 0, strokeDashoffset: lens[i] ?? 0 }));

  const entrance = gsap.timeline({ paused: true, defaults: { ease: EASE }, onComplete: () => void (inView && loops.resume()) });
  entrance.to(card, { autoAlpha: 1, y: 0, duration: 0.8 }, 0);
  if (arc) entrance.to(arc, { strokeDashoffset: off, duration: 1.2 }, 0.3);
  entrance.to(num0, { v: target, duration: 1.2, onUpdate: () => void (count && (count.textContent = String(Math.round(num0.v)))) }, 0.3);
  entrance.to(heads[0] ?? [], { autoAlpha: 1, duration: 0.3 }, 0.7);
  entrance.to(matched, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.16 }, 0.8);
  entrance.to(ticks, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out', stagger: 0.16 }, 0.9);
  const afterMatched = 0.8 + 0.16 * Math.max(0, matched.length - 1) + 0.45;
  entrance.to(heads.slice(1), { autoAlpha: 1, duration: 0.3 }, afterMatched);
  entrance.to(missing, { autoAlpha: 1, x: 0, duration: 0.5 }, afterMatched + 0.1);
  entrance.fromTo(alerts, { scale: 0.5, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, afterMatched + 0.2);
  const whyAt = afterMatched + 0.5;
  entrance.to(why, { autoAlpha: 1, y: 0, duration: 0.6 }, whyAt);
  // Soft line-by-line wipe: the clip opens in four steps, the text fades in with it.
  entrance.to(reasoning, { autoAlpha: 1, duration: 0.9, ease: 'power1.out' }, whyAt + 0.25);
  entrance.to(reasoning, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'steps(4)', clearProps: 'clipPath' }, whyAt + 0.25);

  // Idle: a slow float, and every ~8s a quiet shimmer pass over the ring and the ticks drawing again.
  const loops = gsap.timeline({ paused: true });
  loops.to(float, { y: -4, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
  const replay = gsap.timeline({ repeat: -1, repeatDelay: 5.6 });
  replay.fromTo(shimmer, { xPercent: 0 }, { xPercent: 200, duration: 1.4, ease: 'power1.inOut' }, 0);
  replay.fromTo(ticks, { strokeDashoffset: (i: number) => lens[i] ?? 0 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out', stagger: 0.18, immediateRender: false }, 0.9);
  loops.add(replay, 0);

  let played = false;
  let inView = false;
  const play = (): void => {
    if (played) return;
    played = true;
    entrance.play(0.15);
  };
  ScrollTrigger.create({
    trigger: card,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      inView = self.isActive;
      if (inView) {
        play();
        if (entrance.progress() === 1) loops.resume();
      } else loops.pause();
    },
  });
  // Never leave the card hidden if a trigger misfires.
  window.setTimeout(() => {
    if (!played && card.getBoundingClientRect().top < window.innerHeight) {
      inView = true;
      played = true;
      entrance.progress(1);
      loops.resume();
    }
  }, 4000);
}

export function initHero(root: HTMLElement): void {
  initHeroCard(root);
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
