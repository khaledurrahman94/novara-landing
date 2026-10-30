/**
 * The global interaction layer: contextual cursor pill, magnetic buttons, cursor tilt with
 * depth parallax (scroll depth lives in depth.ts). All of it is off under reduced motion, and the pill, magnets
 * and tilt are fine-pointer only (the idle drift covers touch).
 */
import { gsap } from '../../../scripts/motion';
import { $, clamp, finePointer, num, remScale } from './util';

const strength = new WeakMap<Element, number>();
/** Scale a tilt root's parallax and tilt (1 = full, 0 = flat). The hero lowers it as the screen assembles. */
const updaters = new WeakMap<Element, () => void>();
export const setStrength = (el: Element, k: number): void => {
  strength.set(el, clamp(k, 0, 1));
  updaters.get(el)?.();
};

/* ---------- contextual cursor pill ---------- */

function initCursor(): () => void {
  const pill = document.createElement('div');
  pill.className = 'home-cursor';
  pill.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  pill.append(label);
  document.body.append(pill);
  gsap.set(pill, { autoAlpha: 0, scale: 0.85, x: -100, y: -100 });
  const xTo = gsap.quickTo(pill, 'x', { duration: 0.28, ease: 'power3.out' });
  const yTo = gsap.quickTo(pill, 'y', { duration: 0.28, ease: 'power3.out' });
  let shown = false;
  let lastX = -100;
  let lastY = -100;

  const show = (text: string): void => {
    if (label.textContent !== text) label.textContent = text;
    if (shown) return;
    shown = true;
    gsap.set(pill, { x: lastX + 14, y: lastY + 16 });
    gsap.to(pill, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'expo.out', overwrite: 'auto' });
  };
  const hide = (): void => {
    if (!shown) return;
    shown = false;
    gsap.to(pill, { autoAlpha: 0, scale: 0.85, duration: 0.15, ease: 'power2.in', overwrite: 'auto' });
  };
  const onMove = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    lastX = e.clientX;
    lastY = e.clientY;
    xTo(lastX + 14);
    yTo(lastY + 16);
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
    const text = el?.dataset['cursor'];
    if (text) show(text);
    else hide();
  };
  const onLeave = (e: MouseEvent): void => {
    if (!e.relatedTarget) hide();
  };
  const onDown = (): void => {
    if (shown) gsap.to(pill, { scale: 0.92, duration: 0.1, overwrite: 'auto' });
  };
  const onUp = (): void => {
    if (shown) gsap.to(pill, { scale: 1, duration: 0.25, ease: 'back.out(2)', overwrite: 'auto' });
  };
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('mouseout', onLeave);
  document.addEventListener('pointerdown', onDown);
  document.addEventListener('pointerup', onUp);
  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('mouseout', onLeave);
    document.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerup', onUp);
    pill.remove();
  };
}

/* ---------- magnetic primary buttons ---------- */

function initMagnetic(): () => void {
  const cleanups: (() => void)[] = [];
  $(document, '[data-magnetic], [data-demo-form] button[type="submit"]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    let cx = 0;
    let cy = 0;
    const onEnter = (): void => {
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2 - num(String(gsap.getProperty(el, 'x')));
      cy = r.top + r.height / 2 - num(String(gsap.getProperty(el, 'y')));
    };
    const onMove = (e: PointerEvent): void => {
      xTo(clamp((e.clientX - cx) * 0.3, -6, 6));
      yTo(clamp((e.clientY - cy) * 0.3, -6, 6));
    };
    const onLeave = (): void => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.set(el, { clearProps: 'x,y' });
    });
  });
  return () => cleanups.forEach((c) => c());
}

/* ---------- cursor tilt and depth parallax ---------- */

function initTilt(fine: boolean): () => void {
  const cleanups: (() => void)[] = [];
  $(document, '[data-tilt]').forEach((root) => {
    const max = num(root.dataset['tiltMax'], 6);
    const viewportMode = root.dataset['tilt'] === 'viewport';
    const idle = root.dataset['idle'] !== undefined;
    gsap.set(root, { transformPerspective: 1400 * remScale() });
    const rx = gsap.quickTo(root, 'rotationX', { duration: 0.7, ease: 'power3.out' });
    const ry = gsap.quickTo(root, 'rotationY', { duration: 0.7, ease: 'power3.out' });
    const depthEls = $(root, '[data-depth]');
    const kids = depthEls.map((el) => ({
      d: num(el.dataset['depth']),
      x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' }),
    }));
    let visible = false;
    let nx = 0;
    let ny = 0;
    const apply = (): void => {
      const k = strength.get(root) ?? 1;
      rx(-ny * max * k);
      ry(nx * max * k);
      const u = remScale();
      kids.forEach((o) => {
        o.x(nx * o.d * 10 * k * u);
        o.y(ny * o.d * 10 * k * u);
      });
    };
    updaters.set(root, apply);
    const io = new IntersectionObserver(([entry]) => void (visible = !!entry?.isIntersecting), { rootMargin: '100px' });
    io.observe(root);

    const cleanup: (() => void)[] = [() => io.disconnect()];
    if (fine) {
      if (viewportMode) {
        const onMove = (e: PointerEvent): void => {
          if (!visible) return;
          nx = (e.clientX / window.innerWidth - 0.5) * 2;
          ny = (e.clientY / window.innerHeight - 0.5) * 2;
          apply();
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        cleanup.push(() => window.removeEventListener('pointermove', onMove));
      } else {
        const onMove = (e: PointerEvent): void => {
          const r = root.getBoundingClientRect();
          nx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
          ny = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
          apply();
        };
        const onLeave = (): void => {
          nx = 0;
          ny = 0;
          apply();
        };
        root.addEventListener('pointermove', onMove);
        root.addEventListener('pointerleave', onLeave);
        cleanup.push(() => {
          root.removeEventListener('pointermove', onMove);
          root.removeEventListener('pointerleave', onLeave);
        });
      }
    } else if (idle) {
      // Touch: a slow drift stands in for the cursor, only while on screen.
      const tick = (t: number): void => {
        if (!visible) return;
        nx = Math.sin(t * 0.5) * 0.7;
        ny = Math.cos(t * 0.37) * 0.5;
        apply();
      };
      gsap.ticker.add(tick);
      cleanup.push(() => gsap.ticker.remove(tick));
    }
    cleanup.push(() => gsap.set([root, ...depthEls], { clearProps: 'transform' }));
    cleanups.push(() => cleanup.forEach((c) => c()));
  });
  return () => cleanups.forEach((c) => c());
}

/** Pointer-driven pieces. Returns a cleanup. Not called under reduced motion. */
export function initInteraction(): () => void {
  const fine = finePointer();
  const cleanups: (() => void)[] = [];
  if (fine) cleanups.push(initCursor(), initMagnetic());
  cleanups.push(initTilt(fine));
  return () => cleanups.forEach((c) => c());
}
