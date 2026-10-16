import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let started = false;

/** Idempotent: registers ScrollTrigger and starts Lenis (not under reduced motion). */
function start(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  gsap.registerPlugin(ScrollTrigger);
  // Resize and rotation re-measure every pin (the fluid root changes rem sizes with the viewport),
  // and so does a ScaleToFit factor change.
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize,orientationchange' });
  let fitTimer = 0;
  window.addEventListener('novara:fit', () => {
    window.clearTimeout(fitTimer);
    fitTimer = window.setTimeout(() => ScrollTrigger.refresh(), 60);
  });
  if (prefersReducedMotion()) return;
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Run cb once DOM is ready and motion is bootstrapped. cb may return a cleanup fn (run on astro:before-swap). */
export function onReady(cb: () => void | (() => void)): void {
  if (typeof window === 'undefined') return;
  const run = (): void => {
    start();
    const cleanup = cb();
    if (typeof cleanup === 'function') {
      document.addEventListener('astro:before-swap', cleanup, { once: true });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}

export const getLenis = (): Lenis | null => lenis;
export { gsap, ScrollTrigger };
