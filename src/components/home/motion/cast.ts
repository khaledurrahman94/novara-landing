/**
 * The people behind the testimonials, shuffled once per page load (Fisher-Yates, Math.random, no seed) so nobody is
 * prioritised. The first OFFERED entries are the Offered avatars in Results, left to right, and the testimonial cards
 * are reordered to match. Results and Testimonials both import this module, so they always agree.
 */
import { home } from '../../../content/home';

export const OFFERED = 4;

/** First letter of the first and last word of a name: "Mukul Aryal" gives "MA". */
export function initialsOf(name: string): string {
  const w = name.trim().split(/\s+/);
  return ((w[0]?.[0] ?? '') + (w.length > 1 ? (w[w.length - 1]?.[0] ?? '') : '')).toUpperCase();
}

export interface Person {
  key: string;
  name: string;
  initials: string;
}

function shuffle<T>(a: readonly T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j] as T, r[i] as T];
  }
  return r;
}

const people: Person[] = home.testimonials.items.map((i) => ({ key: i.key, name: i.name, initials: initialsOf(i.name) }));

/**
 * Only the first OFFERED people in home.ts (the batch that went from 1,200 applicants to 4 offers) are ever in the
 * funnel; the others are never Offered avatars. Each group is shuffled within itself: the four Offered seats, then
 * the other three cards after them.
 */
export const cast: readonly Person[] = [...shuffle(people.slice(0, OFFERED)), ...shuffle(people.slice(OFFERED))];
