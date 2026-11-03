import type { Draggable } from 'gsap/Draggable';
import { getLenis, prefersReducedMotion } from '../../../scripts/motion';

export const EASE = 'expo.out';

/**
 * Which motion system a device gets. It depends on the kind of device, never on how tall the window is:
 * a short laptop window or a second monitor keeps the full pinned experience, and the page scales to fit
 * (the fluid root size in styles/fluid.css follows the viewport height). Phones, narrow or in landscape
 * (a touch screen that is also short), get the reduced, in-flow motion.
 */
const PHONE_LANDSCAPE = '(hover: none) and (pointer: coarse) and (max-height: 500px)';
/** Desktop, laptop and tablet: pinned scenes. */
export const FULL_MQ = `(min-width: 768px) and (not (${PHONE_LANDSCAPE}))`;
/** Pinned scenes that also need two columns side by side (the interview lab). */
export const FULL_WIDE_MQ = `(min-width: 1024px) and (not (${PHONE_LANDSCAPE}))`;
/** Phones: reduced motion, no pins. The exact complement of FULL_MQ. */
export const PHONE_MQ = `(max-width: 767.98px), ${PHONE_LANDSCAPE}`;
/** The exact complement of FULL_WIDE_MQ. */
export const NOT_WIDE_MQ = `(max-width: 1023.98px), ${PHONE_LANDSCAPE}`;

export const $ = (root: ParentNode, sel: string): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(sel));
export const one = (root: ParentNode, sel: string): HTMLElement | null => root.querySelector<HTMLElement>(sel);
export const num = (v: string | undefined, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
export const cssVar = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
/** 0 before a, 1 after b, linear between. */
export const seg = (t: number, a: number, b: number): number => clamp((t - a) / (b - a), 0, 1);
export const smooth = (t: number): number => t * t * (3 - 2 * t);

/** The fluid root size relative to 16px (1 below 1280px wide). Scale pixel constants by it. */
export const remScale = (): number => (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16;

/** Height of the sticky nav in px (it is rem-sized, so it follows the fluid root). */
export const navH = (): number => document.querySelector<HTMLElement>('[data-nav]')?.offsetHeight ?? 64;

export function scrollToEl(el: HTMLElement): void {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -navH() });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Seeded PRNG so dot data is the same on every load. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Run an init and keep going if it throws, so one broken section never takes the page down. */
export function safe<T>(label: string, fn: () => T): T | undefined {
  try {
    return fn();
  } catch (err) {
    console.error(`Home ${label} failed`, err);
    return undefined;
  }
}

/**
 * On touch, a Draggable would set touch-action: none and trap vertical swipes. Instead the drag
 * starts only after a ~250ms press-and-hold; a swipe that moves first scrolls the page.
 * Fine pointers are unchanged.
 */
export function holdToDrag(el: HTMLElement, d: Draggable): () => void {
  if (window.matchMedia('(pointer: fine)').matches) return () => undefined;
  d.disable();
  el.style.touchAction = 'pan-y';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let armed = false;
  let sx = 0;
  let sy = 0;
  let last: PointerEvent | null = null;
  let off: ReturnType<typeof setTimeout> | undefined;
  const offAfterThrow = (): void => {
    d.removeEventListener('throwcomplete', offAfterThrow);
    if (!armed) d.disable();
  };
  const stop = (): void => {
    clearTimeout(timer);
    if (!armed) return;
    armed = false;
    // Draggable's own release listeners run after this one, and disable() would remove them,
    // so switch the drag off only once it has released (and finished any throw).
    off = setTimeout(() => {
      if (armed) return;
      if (d.isThrowing) d.addEventListener('throwcomplete', offAfterThrow);
      else d.disable();
    }, 0);
  };
  const onDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse') return;
    sx = e.clientX;
    sy = e.clientY;
    last = e;
    timer = setTimeout(() => {
      armed = true;
      d.enable();
      d.startDrag(last ?? e);
    }, 250);
  };
  const onMove = (e: PointerEvent): void => {
    last = e;
    if (!armed && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) clearTimeout(timer);
  };
  const onTouchMove = (e: TouchEvent): void => {
    if (armed && e.cancelable) e.preventDefault();
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointercancel', stop);
  el.addEventListener('touchmove', onTouchMove, { passive: false });
  return () => {
    clearTimeout(timer);
    clearTimeout(off);
    d.removeEventListener('throwcomplete', offAfterThrow);
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', stop);
    el.removeEventListener('pointercancel', stop);
    el.removeEventListener('touchmove', onTouchMove);
  };
}
