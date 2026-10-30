/**
 * Ghost pointer for auto demos. A 20px circle (look in home.css) that glides with expo.out, presses
 * by scaling to 0.85 for 120ms, then fades. Never created under reduced motion (callers skip demos).
 * Positions are in the host's own coordinate space; the host must be position: relative.
 */
import { gsap } from '../../../scripts/motion';
import { EASE } from './util';

export interface Ghost {
  el: HTMLElement;
  /** Place it without animating (hidden). */
  place: (x: number, y: number) => void;
  /** Append steps to a timeline: fade in, glide to a point, press, fade out. */
  show: (tl: gsap.core.Timeline, at?: gsap.Position) => void;
  glide: (tl: gsap.core.Timeline, x: number, y: number, duration?: number, at?: gsap.Position) => void;
  press: (tl: gsap.core.Timeline, at?: gsap.Position) => void;
  hide: (tl: gsap.core.Timeline, at?: gsap.Position) => void;
  /** Fade out right now, for cancelled demos. */
  vanish: () => void;
  destroy: () => void;
}

export function createGhost(host: HTMLElement): Ghost {
  const el = document.createElement('span');
  el.className = 'home-ghost';
  el.setAttribute('aria-hidden', 'true');
  host.append(el);
  gsap.set(el, { x: 0, y: 0, xPercent: -50, yPercent: -50, opacity: 0, scale: 1 });
  return {
    el,
    place: (x, y) => void gsap.set(el, { x, y }),
    show: (tl, at) => void tl.to(el, { opacity: 0.85, duration: 0.25, ease: 'power2.out' }, at),
    glide: (tl, x, y, duration = 1.1, at) => void tl.to(el, { x, y, duration, ease: EASE }, at),
    press: (tl, at) => void tl.to(el, { scale: 0.85, duration: 0.12, ease: 'power2.out' }, at).to(el, { scale: 1, duration: 0.25, ease: EASE }),
    hide: (tl, at) => void tl.to(el, { opacity: 0, duration: 0.3, ease: 'power2.out' }, at),
    vanish: () => void gsap.to(el, { opacity: 0, scale: 1, duration: 0.2, overwrite: true }),
    destroy: () => {
      gsap.killTweensOf(el);
      el.remove();
    },
  };
}
