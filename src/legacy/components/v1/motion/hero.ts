import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../scripts/motion';
import { SplitText } from 'gsap/SplitText';
import { $$, EASE, T, countTween, primeMockup, playMockup, waveWhileVisible } from './anim';

/** Hero: masked headline lines, layered composition entering with depth, pointer and scroll parallax, stats count once. */
export function initHero(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {};

  const h1 = root.querySelector<HTMLElement>('h1');
  const rise = $$(root, '[data-hero-rise]');
  const layers = $$(root, '[data-enter]');
  const stats = $$(root, '[data-anim="count"]').filter((el) => el.closest('dl'));
  const cards = $$(root, '[data-card]');
  let split: SplitText[] = [];
  let cancelled = false;
  const removers: (() => void)[] = [];

  const ctx = gsap.context(() => {
    // Hide before the first frame; reveal once fonts have settled so line breaks are final.
    if (h1) gsap.set(h1, { autoAlpha: 0 });
    gsap.set(rise, { autoAlpha: 0, y: 24 });
    gsap.set(layers, { autoAlpha: 0, y: (i) => 40 + i * 16, scale: 0.97 });
    cards.forEach((c) => primeMockup(c));
    stats.forEach((el) => (el.textContent = '0'));
  }, root);

  const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);

  void fontsReady.then(() => {
    if (cancelled) return;
    ctx.add(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE } });
      try {
        build(tl);
      } catch {
        // Never leave the page hidden if a plugin fails.
        gsap.set([...(h1 ? [h1] : []), ...rise, ...layers], { clearProps: 'all' });
      }
    });
  });

  const build = (tl: gsap.core.Timeline): void => {
    if (h1) {
      split = $$(h1, '[data-hero-line]').map((l) => new SplitText(l, { type: 'lines', mask: 'lines' }));
      gsap.set(h1, { autoAlpha: 1 });
      const lines = split.flatMap((s) => s.lines);
      tl.from(lines, { yPercent: 110, duration: T.slower + 0.2, stagger: 0.08 }, 0);
    }
    tl.to(rise, { autoAlpha: 1, y: 0, duration: T.slower, stagger: 0.09 }, 0.35);
    tl.to(layers, { autoAlpha: 1, y: 0, scale: 1, duration: 1, stagger: 0.14 }, 0.25);
    cards.forEach((c, i) => tl.add(playMockup(c), 0.7 + i * 0.12));
    stats.forEach((el) => tl.add(countTween(el, 1.4), 0.75));
  };

  ctx.add(() => {
    cards.forEach((c) => {
      if (c.dataset['card'] === 'interview-frame') waveWhileVisible(c);
    });

    // Scroll parallax: three speeds as the hero leaves.
    $$(root, '[data-scroll]').forEach((el) => {
      gsap.to(el, {
        y: Number(el.dataset['scroll']),
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    });

    // Pointer parallax on desktop, 8px max.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 1024) {
      const movers = $$(root, '[data-px]').map((el) => ({
        k: Number(el.dataset['px']),
        x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' }),
      }));
      const move = (e: PointerEvent): void => {
        const r = root.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        movers.forEach((m) => {
          m.x(nx * 8 * m.k);
          m.y(ny * 8 * m.k);
        });
      };
      const leave = (): void =>
        movers.forEach((m) => {
          m.x(0);
          m.y(0);
        });
      root.addEventListener('pointermove', move);
      root.addEventListener('pointerleave', leave);
      removers.push(() => {
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerleave', leave);
      });
    }
  });

  return () => {
    cancelled = true;
    removers.forEach((r) => r());
    split.forEach((s) => s.revert());
    ctx.revert();
    ScrollTrigger.refresh();
  };
}
