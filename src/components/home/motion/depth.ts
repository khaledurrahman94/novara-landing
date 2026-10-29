/**
 * Scroll depth: elements with data-speed drift against the scroll, scrubbed so it reverses exactly.
 * Scroll-driven only; nothing here follows the pointer.
 */
import { gsap } from '../../../scripts/motion';
import { $, num, remScale } from './util';

export function initScrollDepth(): void {
  $(document, '[data-speed]').forEach((el) => {
    const s = num(el.dataset['speed']);
    if (!s) return;
    gsap.fromTo(
      el,
      { y: () => -s * 90 * remScale() },
      { y: () => s * 90 * remScale(), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } },
    );
  });
}
