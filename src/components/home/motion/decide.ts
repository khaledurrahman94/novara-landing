/**
 * Decide: a self-playing animation, once, when the board scrolls into view. The evidence panel follows a
 * spotlight over the three candidates, then Amara's card moves from Completed to HR Round, a "Moved on by you"
 * stamp lands with a spring and her score is revealed again. Nothing here reacts to the pointer or keyboard.
 * Without JS all three evidence panels stay readable; under reduced motion the page shows the end state.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { $, EASE, num, one } from './util';

type Place = 'home' | 'away';

export function initDecide(root: HTMLElement, reduced: boolean): () => void {
  const board = one(root, '[data-board]');
  const card = one(root, '[data-card="amara"]');
  const away = one(root, '[data-slot="away"]');
  const ghost = one(root, '[data-ghost]');
  const drop = one(root, '[data-drop]');
  const stamp = one(root, '[data-stamp]');
  const countFrom = one(root, '[data-count="from"]');
  const countTo = one(root, '[data-count="to"]');
  if (!board || !card || !away || !ghost || !drop || !stamp) return () => undefined;

  let at: Place = 'home';

  /* ---------- evidence: one panel at a time, following the spotlight ---------- */

  const panels = $(root, '[data-evidence]');
  const spots = $(root, '[data-evidence-for]');
  let activeId = 'amara';
  const showEvidence = (id: string, force = false): void => {
    if (id === activeId && !force) return;
    activeId = id;
    spots.forEach((el) => void (el.dataset['spot'] = el.dataset['evidenceFor'] === id ? 'true' : 'false'));
    panels.forEach((p) => {
      const on = p.dataset['evidence'] === id;
      p.dataset['active'] = on ? 'true' : 'false';
      if (!on) return;
      gsap.fromTo(p, { scale: 0.96, autoAlpha: 0, transformOrigin: '0% 0%' }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: EASE, overwrite: true });
      gsap.fromTo(p.querySelectorAll('[data-anim="bar"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.07, ease: EASE, overwrite: true });
      const score = p.querySelector<HTMLElement>('[data-evidence-score]');
      if (score) {
        const o = { v: 0 };
        gsap.to(o, { v: num(score.dataset['count']), duration: 0.6, ease: 'power3.out', onUpdate: () => void (score.textContent = String(Math.round(o.v))) });
      }
    });
  };

  /* ---------- the move ---------- */

  const awayOffset = (): { x: number; y: number } => {
    const r = card.getBoundingClientRect();
    const baseLeft = r.left - num(String(gsap.getProperty(card, 'x')));
    const baseTop = r.top - num(String(gsap.getProperty(card, 'y')));
    const a = away.getBoundingClientRect();
    return { x: a.left - baseLeft, y: a.top - baseTop };
  };
  const target = (to: Place): { x: number; y: number } => (to === 'home' ? { x: 0, y: 0 } : awayOffset());

  const land = (): void => {
    at = 'away';
    card.dataset['landed'] = 'true';
    if (countFrom) countFrom.textContent = '1';
    if (countTo) countTo.textContent = '2';
    drop.dataset['hot'] = 'false';
    if (reduced) {
      gsap.set(stamp, { opacity: 1 });
      gsap.set(ghost, { opacity: 1 });
      gsap.set(drop, { opacity: 0 });
      return;
    }
    gsap.to(ghost, { opacity: 1, duration: 0.25 });
    gsap.to(drop, { opacity: 0, duration: 0.25 });
    gsap.fromTo(
      stamp,
      { opacity: 0, scale: 1.9, rotation: -9, transformOrigin: '0% 50%' },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)', overwrite: true },
    );
    gsap.fromTo(card, { scale: 1.05 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
  };

  /* The end state: Amara in HR Round, stamped. */
  const settle = (): void => {
    const t = target('away');
    gsap.set(card, { x: t.x, y: t.y });
    land();
  };

  let tl: gsap.core.Timeline | null = null;
  let trigger: ScrollTrigger | undefined;

  if (reduced) {
    settle();
  } else {
    tl = gsap.timeline({ paused: true });
    tl.call(() => showEvidence('ines'), undefined, 0.8);
    tl.call(() => showEvidence('kenji'), undefined, 2.4);
    tl.call(() => showEvidence('amara'), undefined, 4.0);
    // The move: Amara carries her evidence into the HR round.
    tl.call(() => void (card.style.zIndex = '20'), undefined, 4.8);
    tl.to(card, { x: () => target('away').x, y: () => target('away').y, duration: 1.1, ease: 'power3.inOut' }, 4.9);
    tl.call(() => void (drop.dataset['hot'] = 'true'), undefined, 5.7);
    tl.call(
      () => {
        card.style.zIndex = '';
        land();
      },
      undefined,
      6.0,
    );
    // The score reveal: her panel counts up again with the move done.
    tl.call(() => showEvidence('amara', true), undefined, 6.9);
    trigger = ScrollTrigger.create({ trigger: board, start: 'top 65%', once: true, onEnter: () => void tl?.play(0) });
  }

  // A resize changes the column positions: keep the moved card on its slot.
  const onResize = (): void => {
    if (at !== 'away') return;
    gsap.killTweensOf(card, 'x,y');
    const t = target('away');
    gsap.set(card, { x: t.x, y: t.y });
  };
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    trigger?.kill();
    tl?.kill();
    gsap.killTweensOf([card, stamp, ghost, drop, ...panels]);
    gsap.set(card, { clearProps: 'x,y,scale' });
  };
}
