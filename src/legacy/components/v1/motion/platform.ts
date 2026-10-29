import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../scripts/motion';
import { $$, EASE, T, playMockup, playOnEnter, plateDepth, primeMockup } from './anim';
import { PIN_MQ, pinScene } from './scene';

/**
 * Platform tabs. JS turns the stacked list into a tab set (clickable, arrow keys).
 * >=1024px with motion: the stage is pinned and scroll scrubs through the tabs. A segmented control on mobile.
 */
export function initPlatform(root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('[data-scene-stage]');
  const tabs = $$(root, '[data-tab]');
  const panels = $$(root, '[data-panel]');
  if (!stage || tabs.length === 0 || tabs.length !== panels.length) return () => {};
  const total = panels.length;
  const reduced = prefersReducedMotion();
  let active = 0;
  let scene: ReturnType<typeof pinScene> | null = null;

  root.setAttribute('data-tabs', '');

  const show = (i: number, animate: boolean): void => {
    active = i;
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      t.tabIndex = k === i ? 0 : -1;
    });
    panels.forEach((p, k) => {
      if (k === i) {
        p.removeAttribute('inert');
        p.removeAttribute('aria-hidden');
        if (animate) gsap.fromTo(p, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: T.slower, ease: EASE, overwrite: true });
        else gsap.set(p, { autoAlpha: 1, y: 0 });
        const plate = p.querySelector<HTMLElement>('[data-plate]');
        if (plate && animate && !reduced) playMockup(plate, 0.1);
      } else {
        p.setAttribute('inert', '');
        p.setAttribute('aria-hidden', 'true');
        if (animate) gsap.to(p, { autoAlpha: 0, y: -12, duration: T.base, ease: 'power2.in', overwrite: true });
        else gsap.set(p, { autoAlpha: 0 });
      }
    });
  };

  const goTo = (i: number): void => {
    if (scene) {
      scene.goTo(i);
    } else {
      show(i, !reduced);
    }
  };

  const listeners: [HTMLElement, string, EventListener][] = [];
  tabs.forEach((t, i) => {
    const click = (): void => goTo(i);
    const key = (e: Event): void => {
      const k = (e as KeyboardEvent).key;
      let n = -1;
      if (k === 'ArrowRight') n = (active + 1) % total;
      else if (k === 'ArrowLeft') n = (active - 1 + total) % total;
      else if (k === 'Home') n = 0;
      else if (k === 'End') n = total - 1;
      if (n < 0) return;
      e.preventDefault();
      tabs[n]?.focus();
      goTo(n);
    };
    t.addEventListener('click', click);
    t.addEventListener('keydown', key);
    listeners.push([t, 'click', click], [t, 'keydown', key]);
  });

  const plates = panels.map((p) => p.querySelector<HTMLElement>('[data-plate]')).filter((p): p is HTMLElement => !!p);

  if (!reduced) plates.forEach((p) => primeMockup(p));

  const mm = gsap.matchMedia();
  mm.add(
    {
      pin: PIN_MQ,
      flow: '(max-width: 1023.98px), (max-height: 679.98px), (prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { pin } = ctx.conditions as { pin: boolean; flow: boolean };
      show(0, false);

      if (!pin) {
        scene = null;
        if (!reduced) {
          const p0 = plates[0];
          if (p0) playOnEnter(p0, stage, 'top 78%');
          plateDepth(stage);
        }
        return;
      }

      root.setAttribute('data-pinned', '');
      const p0 = plates[0];
      if (p0) ScrollTrigger.create({ trigger: stage, start: 'top 70%', once: true, onEnter: () => void playMockup(p0) });

      scene = pinScene(stage, total, 0.4, (p) => {
        const i = Math.min(total - 1, Math.floor(p));
        if (i !== active) show(i, true);
      });

      return () => {
        scene?.destroy();
        root.removeAttribute('data-pinned');
        scene = null;
      };
    },
    root,
  );

  return () => {
    mm.revert();
    listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
    root.removeAttribute('data-tabs');
    gsap.set(panels, { clearProps: 'all' });
    panels.forEach((p) => {
      p.removeAttribute('inert');
      p.removeAttribute('aria-hidden');
    });
  };
}
