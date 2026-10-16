import { getLenis, prefersReducedMotion } from '../../../scripts/motion';

export const EASE = 'expo.out';

export const $ = (root: ParentNode, sel: string): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(sel));
export const one = (root: ParentNode, sel: string): HTMLElement | null => root.querySelector<HTMLElement>(sel);
export const num = (v: string | undefined, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
export const cssVar = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const finePointer = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
/** 0 before a, 1 after b, linear between. */
export const seg = (t: number, a: number, b: number): number => clamp((t - a) / (b - a), 0, 1);
export const smooth = (t: number): number => t * t * (3 - 2 * t);

export function scrollToEl(el: HTMLElement): void {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -64 });
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
    console.error(`V3 ${label} failed`, err);
    return undefined;
  }
}
