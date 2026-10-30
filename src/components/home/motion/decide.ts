/**
 * Decide: drag Amara's card to HR Round. Draggable gives 1:1 tracking and rubber-banding at the
 * board's edge; on release, InertiaPlugin carries the card's own velocity to whichever column
 * it was heading for, and a stamp lands with a spring. The card moves both ways. The arrow keys
 * do the same move for keyboard users, and touch uses press-and-hold to drag. Hovering or focusing
 * a card shows its evidence.
 */
import { gsap } from '../../../scripts/motion';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { home as copy } from '../../../content/home';
import { $, EASE, holdToDrag, num, one } from './util';

gsap.registerPlugin(Draggable, InertiaPlugin);

type Place = 'home' | 'away';

export function initDecide(root: HTMLElement, reduced: boolean): () => void {
  const board = one(root, '[data-board]');
  const card = one(root, '[data-card="amara"]');
  const home = one(root, '[data-slot="home"]');
  const away = one(root, '[data-slot="away"]');
  const ghost = one(root, '[data-ghost]');
  const drop = one(root, '[data-drop]');
  const stamp = one(root, '[data-stamp]');
  const status = one(root, '[data-decide-status]');
  const countFrom = one(root, '[data-count="from"]');
  const countTo = one(root, '[data-count="to"]');
  if (!board || !card || !home || !away || !ghost || !drop || !stamp || !status) return () => undefined;

  let at: Place = 'home';

  /* ---------- evidence ---------- */

  const panels = $(root, '[data-evidence]');
  const triggers = $(root, '[data-evidence-for]');
  let activeId = 'amara';
  const showEvidence = (id: string): void => {
    if (id === activeId) return;
    activeId = id;
    panels.forEach((p) => {
      const on = p.dataset['evidence'] === id;
      p.dataset['active'] = on ? 'true' : 'false';
      if (!on || reduced) return;
      gsap.fromTo(p, { scale: 0.96, autoAlpha: 0, transformOrigin: '0% 0%' }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: EASE, overwrite: true });
      gsap.fromTo(p.querySelectorAll('[data-anim="bar"]'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.07, ease: EASE, overwrite: true });
      const score = p.querySelector<HTMLElement>('[data-evidence-score]');
      if (score) {
        const o = { v: 0 };
        gsap.to(o, { v: num(score.dataset['count']), duration: 0.6, ease: 'power3.out', onUpdate: () => void (score.textContent = String(Math.round(o.v))) });
      }
    });
  };
  const evCleanups = triggers.map((el) => {
    const id = el.dataset['evidenceFor'] ?? '';
    const on = (): void => showEvidence(id);
    el.addEventListener('pointerenter', on);
    el.addEventListener('focusin', on);
    return () => {
      el.removeEventListener('pointerenter', on);
      el.removeEventListener('focusin', on);
    };
  });

  /* ---------- the move ---------- */

  const targets = (): Record<Place, { x: number; y: number }> => {
    const r = card.getBoundingClientRect();
    const baseLeft = r.left - num(String(gsap.getProperty(card, 'x')));
    const baseTop = r.top - num(String(gsap.getProperty(card, 'y')));
    const a = away.getBoundingClientRect();
    return { home: { x: 0, y: 0 }, away: { x: a.left - baseLeft, y: a.top - baseTop } };
  };

  const land = (to: Place, announce: boolean): void => {
    at = to;
    const isAway = to === 'away';
    card.dataset['landed'] = isAway ? 'true' : 'false';
    if (countFrom) countFrom.textContent = isAway ? '1' : '2';
    if (countTo) countTo.textContent = isAway ? '2' : '1';
    if (announce) status.textContent = isAway ? copy.decide.movedStatus : copy.decide.backStatus;
    drop.dataset['hot'] = 'false';
    if (reduced) {
      gsap.set(stamp, { opacity: isAway ? 1 : 0 });
      gsap.set(ghost, { opacity: isAway ? 1 : 0 });
      gsap.set(drop, { opacity: isAway ? 0 : 1 });
      return;
    }
    gsap.to(ghost, { opacity: isAway ? 1 : 0, duration: 0.25 });
    gsap.to(drop, { opacity: isAway ? 0 : 1, duration: 0.25 });
    if (isAway) {
      gsap.fromTo(
        stamp,
        { opacity: 0, scale: 1.9, rotation: -9, transformOrigin: '0% 50%' },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)', overwrite: true },
      );
      gsap.fromTo(card, { scale: 1.05 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    } else {
      gsap.to(stamp, { opacity: 0, duration: 0.2, overwrite: true });
    }
  };

  /** Move without a drag: the arrow keys, or reduced motion. */
  const moveTo = (to: Place): void => {
    if (at === to && !gsap.isTweening(card)) return;
    const t = targets()[to];
    gsap.killTweensOf(card, 'x,y');
    if (reduced) {
      gsap.set(card, { x: t.x, y: t.y });
      land(to, true);
      return;
    }
    gsap.to(card, { x: t.x, y: t.y, duration: 0.7, ease: 'back.out(1.5)', onComplete: () => land(to, true) });
  };

  if (!reduced) InertiaPlugin.track(card, 'x,y');
  const drag = Draggable.create(card, {
    type: 'x,y',
    bounds: board,
    edgeResistance: 0.8,
    zIndexBoost: true,
    onPress: () => {
      // Disabling the Draggable (hold-to-drag on touch) untracks velocity; track again on every press.
      if (!reduced) InertiaPlugin.track(card, 'x,y');
      gsap.killTweensOf(card, 'x,y,scale');
      card.classList.add('is-dragging');
      gsap.killTweensOf(stamp);
      showEvidence('amara');
    },
    onDrag: function (this: Draggable) {
      const t = targets();
      const mid = t.away.x / 2;
      drop.dataset['hot'] = String(this.x > mid && at === 'home');
    },
    onRelease: function (this: Draggable) {
      card.classList.remove('is-dragging');
      const t = targets();
      const speed = (v: number | undefined): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
      const vx = reduced ? 0 : speed(InertiaPlugin.getVelocity(card, 'x'));
      const vy = reduced ? 0 : speed(InertiaPlugin.getVelocity(card, 'y'));
      // Where the card would coast to; pick the column nearest that point.
      const px = this.x + vx * 0.18;
      const py = this.y + vy * 0.18;
      const dHome = Math.hypot(px - t.home.x, py - t.home.y);
      const dAway = Math.hypot(px - t.away.x, py - t.away.y);
      const to: Place = dAway < dHome ? 'away' : 'home';
      const end = t[to];
      if (reduced) {
        gsap.set(card, { x: end.x, y: end.y });
        land(to, to !== at);
        return;
      }
      const done = (): void => land(to, to !== at);
      if (Math.hypot(vx, vy) < 250) {
        // A slow release: a short spring into the column.
        gsap.to(card, { x: end.x, y: end.y, duration: 0.55, ease: 'back.out(1.4)', onComplete: done });
      } else {
        // A throw: carry the card's own velocity and land it exactly on the column.
        // Velocities are passed in, not 'auto': on touch, hold-to-drag stops tracking before the tween starts.
        gsap.to(card, { inertia: { x: { velocity: vx, end: end.x }, y: { velocity: vy, end: end.y } }, onComplete: done });
      }
    },
  })[0];

  const unhold = drag ? holdToDrag(card, drag) : () => undefined;
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveTo('away');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveTo('home');
    }
  };
  card.addEventListener('keydown', onKey);
  const onResize = (): void => {
    gsap.killTweensOf(card, 'x,y');
    const t = targets()[at];
    gsap.set(card, { x: t.x, y: t.y });
    drag?.update();
  };
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    card.removeEventListener('keydown', onKey);
    evCleanups.forEach((c) => c());
    unhold();
    drag?.kill();
    InertiaPlugin.untrack(card);
    gsap.set(card, { clearProps: 'x,y,scale' });
  };
}
