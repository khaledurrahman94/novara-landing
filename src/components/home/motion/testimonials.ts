/**
 * Testimonials. The cards are reordered per visit to the shuffled cast (cast.ts), so which four people are the
 * Offered avatars in Results, and which cards come first, change on every load and nobody is prioritised.
 *
 * Wide screens (the query that pins Results): after the stepped Results pin releases the photos sit still, then once the cards show they shrink to
 * small primary dots and travel, scrubbed with scroll, along gentle curves toward their cards, each trailing a soft
 * tapered fade; at its slot the dot grows back into the photo and the card's name and quote come in. Everything is
 * drawn on one fixed full-viewport canvas that is shown only while the fly is active. Position, trail and morph are
 * pure functions of the scrubbed progress (the trail samples earlier moments of the same path), so scrolling back
 * retracts them exactly. Cards whose avatar slot is outside the scroller at rest are not flown into: their dot
 * fades out at the scroller's right edge and the card is simply there. Phones, reduced motion and no JS: nothing
 * is hidden, no canvas.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { $, clamp, lerp, one } from './util';
import { getResultsBridge } from './results';
import { cast, OFFERED } from './cast';

/** Put the cards in the shuffled cast order and mark the first four (the fly targets) as not plain-reveal. Run before reveals are bound. */
export function shuffleTestimonials(root: HTMLElement): void {
  const list = one(root, '[data-testi-scroll] ul');
  if (!list) return;
  const items = new Map<string, HTMLElement>();
  $(list, ':scope > li:not([data-clone])').forEach((li) => items.set(li.querySelector<HTMLElement>('[data-testi]')?.dataset['testi'] ?? '', li));
  cast.forEach((p, i) => {
    const li = items.get(p.key);
    if (!li) return;
    list.appendChild(li);
    const card = li.querySelector('[data-testi]');
    if (i < OFFERED) card?.removeAttribute('data-reveal');
    else card?.setAttribute('data-reveal', '');
  });
  // The endless row keeps duplicates of the cards on both sides; ask it to rebuild them from the new order.
  one(root, '[data-testi-scroll]')?.dispatchEvent(new CustomEvent('testi:rebuild'));
}

/** Plain in-place reveal, used when the pinned stage is not (phones, short screens). */
export function initTestimonialsSimple(root: HTMLElement): void {
  $(root, '[data-testi]:not([data-reveal])').forEach((el) => {
    gsap.set(el, { autoAlpha: 0, y: 20 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => void gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }),
    });
  });
}

/** Document-space top-left of an element, from the layout chain (independent of scroll and of pin state). */
function docPos(el: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

interface Pt {
  x: number;
  y: number;
}
interface Flyer {
  key: string;
  img: HTMLElement | null;
  slot: HTMLElement;
  body: HTMLElement[];
  photo: HTMLImageElement;
  /** Whether the card's avatar slot is on screen at rest, so the dot can land in it. */
  vis: boolean;
  landed: boolean;
  from: Pt & { r: number };
  to: Pt & { r: number };
  ctrl: Pt;
  start: number;
  bend: number;
}

const DOT_R = 5;
const DUR = 0.73;
const STEP = 0.09;
const TRAIL_N = 16;
const TRAIL_DT = 0.014;
/** Per-dot curve bend (fraction of the distance), alternating sides, so the four paths differ. */
const BENDS = [0.22, -0.17, 0.3, -0.25];

function hexRgb(v: string, fb: [number, number, number]): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(v.trim());
  if (!m || !m[1]) return fb;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function initTestimonialsFly(root: HTMLElement): (() => void) | void {
  const bridge = getResultsBridge();
  const scroller = one(root, '[data-testi-scroll]');
  if (!bridge || !scroller) return initTestimonialsSimple(root);

  const keys = bridge.avatars().map((a) => a.key);
  const cards = $(root, '[data-testi]:not([data-reveal])').filter((c) => keys.includes(c.dataset['testi'] ?? ''));
  if (cards.length < keys.length || !keys.length) return initTestimonialsSimple(root);

  const cs = getComputedStyle(document.documentElement);
  const primary = hexRgb(cs.getPropertyValue('--color-primary'), [114, 55, 251]);
  const trailRgb = hexRgb(cs.getPropertyValue('--color-primary-400'), [159, 115, 253]);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:30;pointer-events:none;display:none;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return initTestimonialsSimple(root);
  }
  const g = ctx;
  let vw = 0;
  let vh = 0;
  const sizeCanvas = (): void => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
  };

  const flyers: Flyer[] = [];
  cards.forEach((card, i) => {
    const slot = one(card, '[data-testi-avatar]');
    if (!slot) return;
    const key = card.dataset['testi'] ?? '';
    const photo = new Image();
    photo.decoding = 'async';
    photo.src = `/people/${key}.webp`;
    flyers.push({
      key,
      img: one(slot, 'img'),
      slot,
      body: $(card, '[data-testi-body]'),
      photo,
      vis: true,
      landed: false,
      from: { x: 0, y: 0, r: 24 },
      to: { x: 0, y: 0, r: 24 },
      ctrl: { x: 0, y: 0 },
      start: i * STEP,
      bend: BENDS[i % BENDS.length] ?? 0.2,
    });
  });

  /** Start (canvas avatar when the pin releases) and end (card slot), in document space. Runs on refresh, never per frame. */
  const measure = (): void => {
    sizeCanvas();
    const start = bridge.avatars();
    const sc = docPos(scroller);
    const pad = parseFloat(getComputedStyle(scroller).paddingLeft) || 0;
    const right = sc.x + scroller.clientWidth - pad;
    // The endless row rests with the real first card at the left edge. Measure slots relative to it so the result does
    // not depend on where the row happens to be scrolled (or on the duplicates before it).
    const first = scroller.querySelector<HTMLElement>('li:not([data-clone])');
    const firstX = first ? docPos(first).x : 0;
    flyers.forEach((f) => {
      const size = f.slot.offsetWidth;
      const p = docPos(f.slot);
      let tx = sc.x + pad + (p.x - firstX) + size / 2;
      const ty = p.y + size / 2;
      f.vis = tx + size / 2 <= right;
      if (!f.vis) tx = right - 14;
      f.to = { x: tx, y: ty, r: size / 2 };
      const a = start.find((s) => s.key === f.key);
      f.from = a ? { x: a.x, y: a.y, r: a.d / 2 } : { x: tx, y: ty, r: size / 2 };
      const dx = f.to.x - f.from.x;
      const dy = f.to.y - f.from.y;
      const len = Math.hypot(dx, dy) || 1;
      // A control point off the straight line, plus a small lift, makes a gentle arc.
      f.ctrl = {
        x: (f.from.x + f.to.x) / 2 + (-dy / len) * len * f.bend,
        y: (f.from.y + f.to.y) / 2 + (dx / len) * len * f.bend - len * 0.06,
      };
    });
  };
  measure();

  const hidden = flyers.filter((f) => f.vis);
  const bodies = hidden.flatMap((f) => f.body);
  gsap.set(
    hidden.map((f) => f.img),
    { opacity: 0 },
  );
  gsap.set(bodies, { autoAlpha: 0, y: 12 });

  const moveEase = gsap.parseEase('power3.inOut');
  const outEase = gsap.parseEase('power2.out');
  const inEase = gsap.parseEase('power2.in');

  const posAt = (f: Flyer, u: number): Pt => {
    const m = moveEase(clamp((u - 0.14) / 0.66, 0, 1));
    const k = 1 - m;
    return {
      x: k * k * f.from.x + 2 * k * m * f.ctrl.x + m * m * f.to.x,
      y: k * k * f.from.y + 2 * k * m * f.ctrl.y + m * m * f.to.y,
    };
  };

  /** P is the time-based flight (0..1). `held` is true once the Results pin has released: the photos then sit on this canvas. */
  const state = { p: 0 };
  let held = false;
  let shown = false;

  /**
   * Every state is derived from the current P and `held` on each call, never from earlier frames, so a jump, a fast
   * direction change or a refresh cannot strand anything: landed cards always show their own photo, others never do,
   * and the canvas is hidden unless something is mid-way.
   */
  const draw = (): void => {
    const P = state.p;
    bridge.setLifted(held || P > 0);
    const sx = window.scrollX;
    const sy = window.scrollY;
    const dpr = canvas.width / (vw || 1);
    const active = (held || P > 0) && P < 1;

    flyers.forEach((f) => {
      const u = clamp((P - f.start) / DUR, 0, 1);
      if (f.img) f.img.style.opacity = u >= 1 || !f.vis ? '1' : '0';
    });

    if (!active) {
      if (shown) {
        shown = false;
        canvas.style.display = 'none';
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    if (!shown) {
      shown = true;
      canvas.style.display = 'block';
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, vw, vh);

    flyers.forEach((f) => {
      const u = clamp((P - f.start) / DUR, 0, 1);
      if (u >= 1) return;
      const head = posAt(f, u);
      const hx = head.x - sx;
      const hy = head.y - sy;

      // Trail: earlier moments of the same path, as one tapered, gradient-faded ribbon.
      const fade = (1 - clamp((u - 0.78) / 0.2, 0, 1)) * clamp((u - 0.12) / 0.1, 0, 1);
      if (fade > 0.01) {
        const pts: Pt[] = [];
        for (let k = 0; k <= TRAIL_N; k++) {
          const q = posAt(f, u - k * TRAIL_DT);
          pts.push({ x: q.x - sx, y: q.y - sy });
        }
        const tail = pts[TRAIL_N] as Pt;
        if (Math.hypot(hx - tail.x, hy - tail.y) > 2) {
          const left: Pt[] = [];
          const right: Pt[] = [];
          for (let k = 0; k <= TRAIL_N; k++) {
            const a = pts[Math.max(0, k - 1)] as Pt;
            const b = pts[Math.min(TRAIL_N, k + 1)] as Pt;
            const tx = a.x - b.x;
            const ty = a.y - b.y;
            const tl = Math.hypot(tx, ty) || 1;
            const w = DOT_R * Math.pow(1 - k / TRAIL_N, 1.3);
            const p = pts[k] as Pt;
            left.push({ x: p.x + (-ty / tl) * w, y: p.y + (tx / tl) * w });
            right.push({ x: p.x - (-ty / tl) * w, y: p.y - (tx / tl) * w });
          }
          g.beginPath();
          g.moveTo(left[0]!.x, left[0]!.y);
          for (let k = 1; k <= TRAIL_N; k++) g.lineTo(left[k]!.x, left[k]!.y);
          for (let k = TRAIL_N; k >= 0; k--) g.lineTo(right[k]!.x, right[k]!.y);
          g.closePath();
          const grad = g.createLinearGradient(hx, hy, tail.x, tail.y);
          grad.addColorStop(0, `rgba(${trailRgb[0]},${trailRgb[1]},${trailRgb[2]},${0.42 * fade})`);
          grad.addColorStop(1, `rgba(${trailRgb[0]},${trailRgb[1]},${trailRgb[2]},0)`);
          g.fillStyle = grad;
          g.fill();
        }
      }

      // Head: photo shrinks into a dot, travels, then grows back into the photo at the slot.
      let r: number;
      let photoA: number;
      let dotA: number;
      if (u < 0.78) {
        r = lerp(f.from.r, DOT_R, moveEase(clamp(u / 0.2, 0, 1)));
        photoA = 1 - clamp(u / 0.16, 0, 1);
        dotA = 1 - photoA;
      } else {
        const x = clamp((u - 0.78) / 0.22, 0, 1);
        if (f.vis) {
          r = lerp(DOT_R, f.to.r, outEase(x));
          photoA = clamp((u - 0.78) / 0.17, 0, 1);
          dotA = 1 - clamp((u - 0.78) / 0.14, 0, 1);
        } else {
          r = DOT_R * (1 - inEase(x));
          photoA = 0;
          dotA = 1;
        }
      }
      if (dotA > 0 && r > 0.1) {
        g.globalAlpha = dotA;
        g.fillStyle = `rgb(${primary[0]},${primary[1]},${primary[2]})`;
        g.beginPath();
        g.arc(hx, hy, r, 0, Math.PI * 2);
        g.fill();
      }
      if (photoA > 0 && f.photo.complete && f.photo.naturalWidth) {
        g.globalAlpha = photoA;
        g.save();
        g.beginPath();
        g.arc(hx, hy, r, 0, Math.PI * 2);
        g.clip();
        g.drawImage(f.photo, hx - r, hy - r, r * 2, r * 2);
        g.restore();
      }
      g.globalAlpha = 1;
    });
  };
  flyers.forEach((f) => (f.photo.onload = draw));

  // Time-based: the flight plays (or reverses) in about 2s however fast the visitor scrolls. The whole fly is a pure
  // function of state.p; the card bodies sit on the same timeline, so its end states are exact at p = 0 and p = 1.
  const T = 2.1;
  const tl = gsap.timeline({ paused: true, onUpdate: draw, onComplete: draw, onReverseComplete: draw });
  tl.to(state, { p: 1, duration: T, ease: 'none' }, 0);
  hidden.forEach((f) => {
    tl.to(f.body, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out', stagger: 0.03 }, (f.start + DUR * 0.8) * T);
  });

  // Scroll only decides when the avatars have left the pin (held) and when to play or reverse the flight.
  // Step 6: after the pin releases the photos sit still while the page scrolls; once the cards come into view the flight plays.
  let forward = false;
  let first = true;
  const st = ScrollTrigger.create({
    trigger: scroller,
    start: () => {
      measure();
      return bridge.end();
    },
    endTrigger: scroller,
    end: 'top 75%',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      held = self.progress > 0;
      const want = self.progress >= 0.999;
      if (first) {
        first = false;
        // Loaded or restored already past the fly: land everything at once.
        if (self.progress >= 1) tl.progress(1);
        forward = want;
        if (want && tl.progress() < 1) tl.play();
      } else if (want !== forward) {
        forward = want;
        if (want) tl.play();
        else tl.reverse();
      }
      draw();
    },
  });

  // Refresh (resize, anchor jump, scroll restoration): re-derive the exact end states from the scroll position.
  const onRefresh = (): void => {
    sizeCanvas();
    held = st.progress > 0;
    if (st.progress >= 1) {
      forward = true;
      tl.pause().progress(1);
    } else if (st.progress <= 0) {
      forward = false;
      tl.pause().progress(0);
    }
    draw();
  };
  ScrollTrigger.addEventListener('refresh', onRefresh);
  draw();

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    st.kill();
    tl.kill();
    state.p = 0;
    held = false;
    bridge.setLifted(false);
    canvas.remove();
    gsap.set([...hidden.map((f) => f.img), ...bodies], { clearProps: 'all' });
  };
}
