/**
 * Results. Desktop: a pinned, scrubbed canvas. 1,200 person icons, one per applicant, become 600 screened,
 * then 12 shortlisted, then 4 hired. Everything is drawn from one scroll value `t`, so scrolling
 * back replays it in reverse exactly. Elsewhere (phones, short screens, reduced motion, no JS)
 * the annotated funnel list stays and, with motion, plays once on entry.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { $, EASE, navH, clamp, cssVar, lerp, num, one, rng, seg, smooth } from './util';
import { home } from '../../../content/home';
import { byId, recruiter } from '../../../data/demo';

const N = 1200;
const SURVIVORS = 600;
const SHORTLIST = 12;
const HIRED = 4;
const SKILLS = ['Node.js', 'TypeScript', 'PostgreSQL', 'API design', 'Kubernetes'];
/** Hired first (rank 0..3), then the rest of the shortlist: the demo cast leads, the last initials are filler. */
const INITIALS = [...['amara', 'ines', 'kenji', 'leo', 'marcus'].map((id) => byId(id).initials), recruiter.initials, 'RM', 'HS', 'DK', 'TN', 'AB'];
const TAU = Math.PI * 2;

interface Dot {
  /** 0 screened out, 1 took the AI interview, 2 shortlisted, 3 hired. */
  tier: 0 | 1 | 2 | 3;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  cx: number;
  cy: number;
  /** Stagger position inside the morph, 0..1. */
  s1: number;
  s2: number;
  fit: number;
  skill: string;
  ai: number;
  initials: string;
  x: number;
  y: number;
  r: number;
  a: number;
}

interface Layout {
  cell: number;
  pos: (k: number) => [number, number];
}

function grid(n: number, w: number, h: number, maxCell = Infinity, fixedCols?: number): Layout {
  const cols = fixedCols ?? Math.max(1, Math.ceil(Math.sqrt((n * w) / h)));
  const rows = Math.ceil(n / cols);
  const cell = Math.min(w / cols, h / rows, maxCell);
  const x0 = (w - cols * cell) / 2 + cell / 2;
  const y0 = (h - rows * cell) / 2 + cell / 2;
  return { cell, pos: (k) => [x0 + (k % cols) * cell, y0 + Math.floor(k / cols) * cell] };
}

type Rgb = [number, number, number];
function toRgb(hex: string): Rgb {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const mixStr = (a: Rgb, b: Rgb, t: number): string => {
  const c = mix(a, b, t);
  return `rgb(${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])})`;
};

function buildDots(): Dot[] {
  const rand = rng(1207);
  const perm = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = perm[i] ?? 0;
    perm[i] = perm[j] ?? 0;
    perm[j] = a;
  }
  const dots: Dot[] = Array.from({ length: N }, () => ({
    tier: 0, ax: 0, ay: 0, bx: 0, by: 0, cx: 0, cy: 0, s1: 0, s2: 0, fit: 0, skill: '', ai: 0, initials: '', x: 0, y: 0, r: 0, a: 0,
  }));
  perm.forEach((slot, rank) => {
    const d = dots[slot];
    if (!d) return;
    d.tier = rank < HIRED ? 3 : rank < SHORTLIST ? 2 : rank < SURVIVORS ? 1 : 0;
    const f = rand();
    d.fit = d.tier === 0 ? Math.round(28 + f * 40) : Math.round(70 + f * 25);
    d.skill = SKILLS[Math.floor(rand() * SKILLS.length)] ?? 'Node.js';
    d.ai = Math.round(80 + rand() * 15);
    d.initials = INITIALS[rank] ?? '';
  });
  return dots;
}

export function initResultsPinned(root: HTMLElement): (() => void) | void {
  const stage = one(root, '[data-results-stage]');
  const wrap = one(root, '[data-results-canvas-wrap]');
  const canvas = one(root, '[data-results-canvas]') as HTMLCanvasElement | null;
  const tip = one(root, '[data-results-tip]');
  const phaseEl = one(root, '[data-results-phase]');
  const hint = one(root, '[data-results-hint]');
  const live = one(root, '[data-results-live]');
  const legendEl = one(root, '[data-results-legend]');
  const legend = $(root, '[data-leg]');
  const legCounts = $(root, '[data-leg-count]');
  const ctx = canvas?.getContext('2d');
  if (!stage || !wrap || !canvas || !tip || !phaseEl || !ctx || legend.length < 4) return;

  const dots = buildDots();
  const order = dots.slice().sort((p, q) => p.tier - q.tier);
  const survivors = dots.filter((d) => d.tier >= 1);
  // The 12 sit in two rows of six, with the four hired in the middle of the top row.
  const t2 = dots.filter((d) => d.tier === 2);
  const t3 = dots.filter((d) => d.tier === 3);
  const shortlisted = [t2[0], t3[0], t3[1], t3[2], t3[3], t2[1], ...t2.slice(2)].filter((d): d is Dot => !!d);
  const col = {
    gray: cssVar('--color-gray-400'),
    primary: cssVar('--color-primary'),
    p50: cssVar('--color-primary-50'),
    p100: cssVar('--color-primary-100'),
    p300: cssVar('--color-primary-300'),
    p700: cssVar('--color-primary-700'),
    p800: cssVar('--color-primary-800'),
    white: cssVar('--color-white'),
    ink: cssVar('--color-text-primary'),
  };
  const rgb = { gray: toRgb(col.gray), primary: toRgb(col.primary) };
  const state = { t: 0 };
  let w = 0;
  let h = 0;
  let dpr = 1;
  let hover: Dot | null = null;
  let phase = 0;
  let cellL2 = 0;
  let cell0 = 1;
  let cell1 = 1;
  /** Root-size scale (1 at 16px): canvas pixel constants follow the fluid root like rem does. */
  let u = 1;

  const layout = (): void => {
    w = wrap.clientWidth;
    h = wrap.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    u = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const l0 = grid(N, w, h);
    const l1 = grid(SURVIVORS, w, h, 46 * u);
    // A tidy 6 x 2 block: the cell is capped so the twelve stay a compact, centred group, never spread to fill the canvas.
    const l2 = grid(SHORTLIST, w, h, 104 * u, 6);
    cellL2 = l2.cell;
    dots.forEach((d, i) => {
      [d.ax, d.ay] = l0.pos(i);
    });
    survivors.forEach((d, k) => {
      [d.bx, d.by] = l1.pos(k);
      d.s1 = k / SURVIVORS;
    });
    shortlisted.forEach((d, k) => {
      [d.cx, d.cy] = l2.pos(k);
      d.s2 = k / SHORTLIST;
    });
    cell0 = l0.cell;
    cell1 = l1.cell;
  };

  /** A simple person: a head over rounded shoulders, centred on x, y, fitting inside radius r. */
  const person = (x: number, y: number, r: number): void => {
    const cy = y - r * 0.1;
    ctx.beginPath();
    ctx.arc(x, cy - r * 0.3, r * 0.34, 0, TAU);
    ctx.moveTo(x - r * 0.8, cy + r * 0.85);
    ctx.ellipse(x, cy + r * 0.85, r * 0.8, r * 0.62, 0, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
  };

  const rounded = (x: number, y: number, bw: number, bh: number, r: number): void => {
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, r);
  };

  const placeTip = (): void => {
    if (!hover || tip.hidden) return;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    // Centred over the person, clamped inside the canvas, with the arrow kept pointing at them.
    const tx = clamp(hover.x - tw / 2, 0, Math.max(0, w - tw));
    const gap = 12 * u;
    const above = hover.y - hover.r - 3 - th - gap;
    const badge = hover.tier === 3 && state.t >= 0.86 ? 30 * u : 0;
    const flip = above < 0;
    const ty = clamp(flip ? hover.y + hover.r + 3 + badge + gap : above, 0, Math.max(0, h - th));
    tip.dataset['side'] = flip ? 'bottom' : 'top';
    tip.style.setProperty('--tip-x', `${clamp(hover.x - tx, 12, Math.max(12, tw - 12))}px`);
    tip.style.transform = `translate(${tx}px, ${ty}px)`;
  };

  const draw = (): void => {
    const t = state.t;
    const a1 = smooth(seg(t, 0.08, 0.28));
    const a2 = seg(t, 0.3, 0.52);
    const a3c = smooth(seg(t, 0.54, 0.62));
    const a3m = seg(t, 0.62, 0.78);
    const a4 = smooth(seg(t, 0.8, 0.94));
    const r0 = Math.max(2 * u, cell0 * 0.42);
    const r1 = Math.max(3 * u, Math.min(cell1 * 0.42, 20 * u));
    const rAv = clamp(cellL2 * 0.26, 12 * u, 27 * u);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (a4 > 0.02 && t3.length === HIRED) {
      // A soft band behind the four offers in the top row.
      const first = t3[0];
      const last = t3[HIRED - 1];
      if (first && last) {
        const pad = cellL2 * 0.5;
        ctx.globalAlpha = a4;
        ctx.fillStyle = col.p50;
        ctx.strokeStyle = col.p100;
        ctx.lineWidth = 1;
        rounded(first.cx - pad, first.cy - pad, last.cx - first.cx + pad * 2, pad * 2 + 18 * u, 12 * u);
        ctx.fill();
        ctx.stroke();
      }
    }

    for (const d of order) {
      let x = d.ax;
      let y = d.ay;
      let r = r0;
      let alpha = 0.55;
      if (d.tier === 0) {
        alpha = 0.55 * (1 - a1);
      } else {
        const e2 = smooth(clamp(a2 * 1.5 - 0.5 * d.s1, 0, 1));
        x = lerp(d.ax, d.bx, e2);
        y = lerp(d.ay, d.by, e2);
        r = lerp(r0, r1, e2);
        alpha = lerp(0.55, 0.85, Math.max(a1, e2));
        if (d.tier >= 2) {
          const e3 = smooth(clamp(a3m * 1.5 - 0.5 * d.s2, 0, 1));
          x = lerp(x, d.cx, e3);
          y = lerp(y, d.cy, e3);
          r = lerp(r, rAv, e3);
          alpha = lerp(alpha, 1, a3c);
        } else {
          alpha *= 1 - smooth(a3m);
        }
      }
      d.x = x;
      d.y = y;
      d.r = r;
      d.a = alpha;
      if (alpha <= 0.01) continue;

      const top = d.tier >= 2;
      ctx.globalAlpha = top ? alpha * (1 - a4) : alpha;
      ctx.fillStyle = top ? mixStr(rgb.gray, rgb.primary, a3c) : col.gray;
      if (ctx.globalAlpha > 0.01) person(x, y, r);

      if (top && a4 > 0.02) {
        // The icon becomes an initials avatar; the hired ones get a badge.
        ctx.globalAlpha = a4;
        ctx.fillStyle = d.tier === 3 ? col.primary : col.p100;
        ctx.beginPath();
        ctx.arc(x, y, rAv, 0, TAU);
        ctx.fill();
        if (a4 > 0.35) {
          const k = seg(a4, 0.35, 1);
          ctx.globalAlpha = k;
          ctx.fillStyle = d.tier === 3 ? col.white : col.p800;
          ctx.font = `600 ${Math.round(rAv * 0.62)}px "Inter Variable", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(d.initials, x, y + 0.5);
          if (d.tier === 3) {
            const label = home.results.hired;
            const fs = clamp(Math.round(rAv * 0.38), 10 * u, 13 * u);
            ctx.font = `600 ${fs}px "Inter Variable", system-ui, sans-serif`;
            const bw = ctx.measureText(label).width + 18 * u;
            const bh = fs + 10 * u;
            const by = y + rAv + 8 * u;
            rounded(x - bw / 2, by, bw, bh, bh / 2);
            ctx.fillStyle = col.white;
            ctx.fill();
            ctx.strokeStyle = col.primary;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = col.p700;
            ctx.fillText(label, x, by + bh / 2 + 0.5);
          }
        }
      }
    }
    ctx.globalAlpha = 1;
    if (hover && hover.a > 0.25) {
      ctx.strokeStyle = col.p300;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hover.x, hover.y, hover.r + 3 * u, 0, TAU);
      ctx.stroke();
    }
    placeTip();

    // Counters and captions follow the same value.
    const counts = [
      N,
      Math.round(SURVIVORS * seg(t, 0.08, 0.28)),
      Math.round(SHORTLIST * seg(t, 0.54, 0.66)),
      Math.round(HIRED * seg(t, 0.8, 0.9)),
    ];
    const lit = [0, 0.08, 0.54, 0.8];
    legend.forEach((el, i) => {
      el.style.opacity = String(lerp(0.3, 1, seg(t, lit[i] ?? 0, (lit[i] ?? 0) + 0.04)));
      const c = legCounts[i];
      if (c) {
        const txt = i === 0 ? `${N.toLocaleString('en-US')}+` : String(counts[i] ?? 0);
        if (c.textContent !== txt) c.textContent = txt;
      }
    });
    const p = t < 0.08 ? 0 : t < 0.3 ? 1 : t < 0.54 ? 2 : t < 0.8 ? 3 : 4;
    if (p !== phase) {
      phase = p;
      phaseEl.textContent = home.results.phases[p] ?? '';
      gsap.fromTo(phaseEl, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: EASE, overwrite: 'auto' });
    }
  };

  /* ---------- hover tooltips ---------- */

  const tipText = (d: Dot): string => {
    const t = state.t;
    if (d.tier === 3 && t >= 0.8) return `${home.results.hired} · ${home.results.phases[4]?.replace(/\.$/, '')}`;
    if (d.tier >= 2 && t >= 0.54) return `Shortlisted · Job Fit ${d.fit} · AI Interview ${d.ai}`;
    if (d.tier >= 1 && t >= 0.3) return `Took the AI interview · Job Fit ${d.fit}`;
    return d.tier === 0 ? `Applicant · Job Fit ${d.fit} · Missing: ${d.skill}` : `Applicant · Job Fit ${d.fit} · Matched: ${d.skill}`;
  };
  const showTip = (best: Dot | null, text?: string): void => {
    if (best !== hover) {
      hover = best;
      draw();
    }
    if (!best) {
      tip.hidden = true;
      return;
    }
    tip.textContent = text ?? tipText(best);
    tip.hidden = false;
    placeTip();
  };
  const nearest = (e: PointerEvent, extra: number): Dot | null => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    let best: Dot | null = null;
    let bestD = Infinity;
    for (const d of order) {
      if (d.a < 0.25) continue;
      const dist = Math.hypot(d.x - px, d.y - py);
      if (dist <= Math.max(d.r + 3, 6) + extra && dist <= bestD) {
        best = d;
        bestD = dist;
      }
    }
    return best;
  };

  const onMove = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    showTip(nearest(e, 0));
  };
  const onLeave = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    showTip(null);
  };
  // Touch: tap a dot to read it, tap elsewhere to clear.
  const onTap = (e: PointerEvent): void => {
    if (e.pointerType !== 'touch') return;
    const d = nearest(e, 10);
    showTip(d);
    if (live) live.textContent = d ? tipText(d) : '';
  };
  // Keyboard: arrow keys step through a few sample applicants; the tooltip is announced.
  let step = -1;
  const samples = (): Dot[] => {
    const vis = order.filter((d) => d.a >= 0.25);
    const top = vis.filter((d) => d.tier >= 2);
    const pool = top.length >= 4 ? top : vis;
    const n = Math.min(8, pool.length);
    return Array.from({ length: n }, (_, i) => pool[Math.floor((i * pool.length) / Math.max(1, n))]).filter((d): d is Dot => !!d);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const list = samples();
    if (!list.length) return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    step = (step + dir + list.length * 2) % list.length;
    const d = list[step];
    showTip(d ?? null);
    if (live && d) live.textContent = tipText(d);
  };
  const onBlur = (): void => showTip(null);
  canvas.addEventListener('pointerdown', onTap);
  canvas.addEventListener('keydown', onKey);
  canvas.addEventListener('blur', onBlur);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  /* ---------- pin and scrub ---------- */

  root.classList.add('is-pinned');
  stage.hidden = false;
  if (legendEl) legendEl.hidden = false;
  if (hint) {
    hint.textContent = window.matchMedia('(pointer: fine)').matches ? home.results.hintFine : home.results.hintTouch;
    hint.hidden = false;
  }
  layout();
  draw();
  void document.fonts.load('600 12px "Inter Variable"').then(draw);

  const ro = new ResizeObserver(() => {
    layout();
    draw();
  });
  ro.observe(wrap);

  // About two viewports in all (one to arrive, one of scroll), with short holds at 0.12 and 0.79.
  const tween = gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: () => `top ${navH()}px`,
        end: '+=100%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        refreshPriority: 3,
        invalidateOnRefresh: true,
      },
      onUpdate: draw,
    })
    .to(state, { t: 0.12, duration: 1 })
    .to(state, { t: 0.12, duration: 1.6 })
    .to(state, { t: 0.79, duration: 5.4 })
    .to(state, { t: 0.79, duration: 1.6 })
    .to(state, { t: 1, duration: 1.4 });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    ro.disconnect();
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('pointerdown', onTap);
    canvas.removeEventListener('keydown', onKey);
    canvas.removeEventListener('blur', onBlur);
    root.classList.remove('is-pinned');
    stage.hidden = true;
    if (legendEl) legendEl.hidden = true;
    tip.hidden = true;
    if (hint) hint.hidden = true;
    legend.forEach((el) => (el.style.opacity = ''));
  };
}
/** Phones, short screens: the funnel list draws in once on entry. */
export function initResultsSimple(root: HTMLElement): void {
  const funnel = one(root, '[data-funnel]');
  if (!funnel) return;
  const bars = $(funnel, '[data-funnel-bar]');
  const counts = $(funnel, '[data-count]');
  const callouts = $(funnel, '[data-funnel-callout]');
  const setCount = (el: HTMLElement, v: number): void => {
    el.textContent = Math.round(v).toLocaleString('en-US') + (el.dataset['suffix'] ?? '');
  };
  gsap.set(bars, { scaleX: 0 });
  gsap.set(callouts, { autoAlpha: 0 });
  counts.forEach((el) => setCount(el, 0));
  ScrollTrigger.create({
    trigger: funnel,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline({ defaults: { ease: EASE } });
      bars.forEach((b, i) => tl.to(b, { scaleX: 1, duration: 1.2, ease: 'power3.out' }, i * 0.35));
      counts.forEach((c, i) => {
        const o = { v: 0 };
        tl.to(o, { v: num(c.dataset['count']), duration: 1.2, ease: 'power3.out', onUpdate: () => setCount(c, o.v) }, i * 0.35);
      });
      callouts.forEach((c, i) => tl.to(c, { autoAlpha: 1, duration: 0.7 }, 1.4 + i * 0.4));
    },
  });
}
