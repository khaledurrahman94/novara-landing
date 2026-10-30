/**
 * ScreeningLab behaviour. Scoped to its root, deterministic (see model.ts),
 * and cleans up every listener, tween, Draggable and ScrollTrigger it makes.
 */
import { gsap, ScrollTrigger, onReady, prefersReducedMotion } from '../../../../scripts/motion';
import { Draggable } from 'gsap/Draggable';
import { holdToDrag } from '../../motion/util';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Flip } from 'gsap/Flip';
import { copy } from './copy';
import { APPLICANTS, QUALIFIED_AT, breakdown, rank, score, type Applicant, type Item, type ReqId } from './model';

gsap.registerPlugin(Draggable, InertiaPlugin, Flip, ScrollTrigger);

const byId = new Map(APPLICANTS.map((a) => [a.id, a]));

interface RowRefs {
  a: Applicant;
  li: HTMLElement;
  btn: HTMLButtonElement;
  panel: HTMLElement;
  scoreEl: HTMLElement;
  bar: HTMLElement;
  sub: HTMLElement;
  rankEl: HTMLElement;
  label: HTMLElement;
  matched: HTMLElement;
  missing: HTMLElement;
  cm: HTMLElement;
  cx: HTMLElement;
  reason: HTMLElement;
  /** Rolling number state. */
  n: { v: number };
}

interface CardRefs {
  a: Applicant;
  slot: HTMLElement;
  card: HTMLElement;
  status: HTMLElement;
  btn: HTMLButtonElement;
  arc: SVGCircleElement | null;
  count: HTMLElement | null;
  ring: HTMLElement | null;
  drag: Draggable | null;
  state: 'idle' | 'screening' | 'done';
}

const must = <T extends Element>(scope: ParentNode, sel: string): T => {
  const el = scope.querySelector<T>(sel);
  if (!el) throw new Error(`ScreeningLab: missing ${sel}`);
  return el;
};

function mount(root: HTMLElement): () => void {
  const ac = new AbortController();
  const { signal } = ac;
  const reduced = (): boolean => prefersReducedMotion();

  const figure = root.closest('figure') ?? root;
  const chipsBox = must<HTMLElement>(root, '[data-chips]');
  const chips = Array.from(chipsBox.querySelectorAll<HTMLButtonElement>('[data-req]'));
  const hint = must<HTMLElement>(root, '[data-hint]');
  const list = must<HTMLElement>(root, '[data-list]');
  const ranking = must<HTMLElement>(root, '[data-ranking]');
  const tray = must<HTMLElement>(root, '[data-tray]');
  const trayCards = must<HTMLElement>(root, '[data-tray-cards]');
  const trayHint = must<HTMLElement>(root, '[data-tray-hint]');
  const trayCount = must<HTMLElement>(root, '[data-tray-count]');
  const trayDone = must<HTMLElement>(root, '[data-tray-done]');
  const live = must<HTMLElement>(root, '[data-live]');
  const tplMatched = must<HTMLTemplateElement>(root, '[data-tpl="matched"]');
  const tplMissing = must<HTMLTemplateElement>(root, '[data-tpl="missing"]');

  const active = new Set<ReqId>(chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset['req'] as ReqId));

  /* ---------- refs ---------- */
  const rows = new Map<string, RowRefs>();
  list.querySelectorAll<HTMLElement>('[data-row]').forEach((li) => {
    const a = byId.get(li.dataset['id'] ?? '');
    if (!a) return;
    rows.set(a.id, {
      a,
      li,
      btn: must<HTMLButtonElement>(li, '[data-row-btn]'),
      panel: must<HTMLElement>(li, '[data-panel]'),
      scoreEl: must<HTMLElement>(li, '[data-score]'),
      bar: must<HTMLElement>(li, '[data-bar]'),
      sub: must<HTMLElement>(li, '[data-sub]'),
      rankEl: must<HTMLElement>(li, '[data-rank]'),
      label: must<HTMLElement>(li, '[data-fitlabel]'),
      matched: must<HTMLElement>(li, '[data-matched]'),
      missing: must<HTMLElement>(li, '[data-missing]'),
      cm: must<HTMLElement>(li, '[data-count-matched]'),
      cx: must<HTMLElement>(li, '[data-count-missing]'),
      reason: must<HTMLElement>(li, '[data-reason]'),
      n: { v: 0 },
    });
  });

  const cards = new Map<string, CardRefs>();
  trayCards.querySelectorAll<HTMLElement>('[data-slot]').forEach((slot) => {
    const a = byId.get(slot.dataset['id'] ?? '');
    if (!a) return;
    const card = must<HTMLElement>(slot, '[data-card]');
    cards.set(a.id, {
      a,
      slot,
      card,
      status: must<HTMLElement>(card, '[data-status]'),
      btn: must<HTMLButtonElement>(card, '[data-screen]'),
      arc: card.querySelector<SVGCircleElement>('[data-anim="ring-arc"]'),
      count: card.querySelector<HTMLElement>('[data-anim="count"]'),
      ring: card.querySelector<HTMLElement>('.sl-card-ring'),
      drag: null,
      state: 'idle',
    });
  });

  const inRanking = new Set<string>([...rows.values()].filter((r) => !r.li.hidden).map((r) => r.a.id));
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };

  /* ---------- reveal the interactive parts, hide the static fallbacks ---------- */
  root.querySelectorAll<HTMLElement>('[data-static-reqs]').forEach((el) => (el.hidden = true));
  chipsBox.hidden = false;
  tray.hidden = false;
  root.setAttribute('data-ready', '');

  /* ---------- rendering ---------- */
  const fill = (tpl: HTMLTemplateElement, target: HTMLElement, items: Item[]): void => {
    const nodes = items.map((it) => {
      const li = (tpl.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
      must<HTMLElement>(li, '[data-l]').textContent = it.label;
      must<HTMLElement>(li, '[data-n]').textContent = it.note;
      return li;
    });
    target.replaceChildren(...nodes);
  };

  const paintDetails = (r: RowRefs): void => {
    const b = breakdown(r.a, active);
    const n = b.matched.length + b.missing.length;
    r.sub.textContent = `${b.matched.length} of ${n} requirements met`;
    r.cm.textContent = String(b.matched.length);
    r.cx.textContent = String(b.missing.length);
    fill(tplMatched, r.matched, b.matched);
    fill(tplMissing, r.missing, b.missing);
    r.reason.textContent = b.reason;
  };

  const rollTo = (r: RowRefs, to: number, from?: number): void => {
    gsap.killTweensOf(r.n);
    gsap.killTweensOf(r.bar);
    if (from !== undefined) r.n.v = from;
    r.label.textContent = to >= QUALIFIED_AT ? copy.qualified : copy.notAFit;
    if (reduced()) {
      r.n.v = to;
      r.scoreEl.textContent = String(to);
      gsap.set(r.bar, { scaleX: to / 100 });
      return;
    }
    gsap.to(r.n, {
      v: to,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        r.scoreEl.textContent = String(Math.round(r.n.v));
      },
      onComplete: () => {
        r.scoreEl.textContent = String(to);
      },
    });
    gsap.fromTo(r.bar, { scaleX: from === undefined ? gsap.getProperty(r.bar, 'scaleX') : from / 100 }, { scaleX: to / 100, duration: 0.8, ease: 'power3.out' });
  };

  const visibleIds = (): string[] => [...inRanking];
  const visibleLis = (): HTMLElement[] => visibleIds().map((id) => rows.get(id)?.li).filter((x): x is HTMLElement => !!x);

  const ordinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th');
  };

  let liveTimer = 0;
  const announce = (msg: string): void => {
    window.clearTimeout(liveTimer);
    liveTimer = window.setTimeout(() => {
      live.textContent = msg;
    }, 350);
  };

  /** Recompute scores, re-sort the DOM and animate the move with Flip. */
  const refresh = (opts: { roll?: boolean; entering?: string } = {}): void => {
    const order = rank(visibleIds(), active);
    const enteringLi = opts.entering ? rows.get(opts.entering)?.li : undefined;
    const before = Array.from(list.children).filter((el) => !(el as HTMLElement).hidden && el !== enteringLi);
    const state = Flip.getState(before, { props: 'opacity' });
    if (enteringLi) enteringLi.hidden = false;

    order.forEach((id, i) => {
      const r = rows.get(id);
      if (!r) return;
      const to = score(r.a, active);
      paintDetails(r);
      if (opts.roll !== false) rollTo(r, to, id === opts.entering ? 0 : undefined);
      r.rankEl.textContent = String(i + 1);
      list.append(r.li);
    });
    // Hidden fresh rows stay at the end of the DOM.
    rows.forEach((r) => {
      if (!inRanking.has(r.a.id)) list.append(r.li);
    });

    const moved = order.some((id, i) => before[i] !== rows.get(id)?.li);
    if (moved || enteringLi) {
      Flip.from(state, {
        duration: reduced() ? 0 : 0.7,
        ease: 'power3.out',
        stagger: reduced() ? 0 : 0.025,
        absolute: false,
        onEnter: (els: Element[]) =>
          gsap.fromTo(els, { opacity: 0, y: -14, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: reduced() ? 0 : 0.55, ease: 'expo.out', clearProps: 'transform,opacity' }),
        onLeave: (els: Element[]) => gsap.to(els, { opacity: 0, duration: reduced() ? 0 : 0.25, ease: 'power2.out' }),
      });
    }
    const top = rows.get(order[0] ?? '');
    if (top) announce(`Ranking updated. ${top.a.name} is first with ${score(top.a, active)}.`);
  };

  /* ---------- initial paint ---------- */
  rows.forEach((r) => {
    const s = score(r.a, active);
    r.n.v = s;
    gsap.set(r.bar, { scaleX: s / 100 });
  });
  const setOpen = (r: RowRefs, open: boolean): void => {
    r.li.dataset['open'] = open ? 'true' : 'false';
    r.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    r.panel.toggleAttribute('inert', !open);
  };
  rows.forEach((r) => setOpen(r, r.li.dataset['open'] === 'true'));

  /* ---------- requirement chips ---------- */
  let hintTimer = 0;
  const defaultHint = hint.textContent ?? '';
  chips.forEach((chip) => {
    chip.addEventListener(
      'click',
      () => {
        const id = chip.dataset['req'] as ReqId;
        const on = chip.getAttribute('aria-pressed') === 'true';
        if (on && active.size === 1) {
          chip.setAttribute('aria-disabled', 'true');
          hint.textContent = copy.lastRequirement;
          window.clearTimeout(hintTimer);
          hintTimer = window.setTimeout(() => {
            hint.textContent = defaultHint;
            chip.removeAttribute('aria-disabled');
          }, 2400);
          if (!reduced()) gsap.fromTo(chip, { x: -4 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.35)', clearProps: 'transform' });
          return;
        }
        if (on) active.delete(id);
        else active.add(id);
        chip.setAttribute('aria-pressed', on ? 'false' : 'true');
        chip.removeAttribute('aria-disabled');
        refresh();
      },
      { signal },
    );
  });

  /* ---------- rows: expand and collapse ---------- */
  let refreshTimer = 0;
  const settleScroll = (): void => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), reduced() ? 50 : 520);
  };
  rows.forEach((r) => {
    r.btn.addEventListener(
      'click',
      () => {
        const open = r.li.dataset['open'] !== 'true';
        rows.forEach((o) => {
          if (o !== r && o.li.dataset['open'] === 'true') setOpen(o, false);
        });
        setOpen(r, open);
        settleScroll();
      },
      { signal },
    );
  });

  /* ---------- screening a new application ---------- */
  const setRing = (c: CardRefs, p: number): void => {
    if (c.arc) {
      const circ = Number(c.arc.dataset['circ'] ?? 0);
      c.arc.style.strokeDashoffset = String(circ * (1 - p / 100));
    }
    if (c.count) c.count.textContent = String(Math.round(p));
  };
  const resetRing = (c: CardRefs): void => {
    if (c.arc) c.arc.style.strokeDashoffset = c.arc.dataset['circ'] ?? '0';
    if (c.count) c.count.textContent = '–';
    c.ring?.setAttribute('aria-label', 'Job Fit Score not screened');
  };
  cards.forEach(resetRing);

  const updateTray = (): void => {
    const left = [...cards.values()].filter((c) => c.state !== 'done').length;
    trayCount.textContent = String(left);
    const any = left < cards.size;
    trayDone.hidden = !any;
    trayHint.textContent = left === 0 ? copy.trayDone : copy.trayHint;
    (trayDone.querySelector('p') as HTMLElement | null)?.toggleAttribute('hidden', left !== 0);
  };
  updateTray();

  const spring = (c: CardRefs, done?: () => void): void => {
    gsap.killTweensOf(c.card);
    if (reduced()) {
      gsap.set(c.card, { x: 0, y: 0, scale: 1, rotation: 0 });
      c.drag?.update();
      done?.();
      return;
    }
    gsap.to(c.card, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.7)',
      onUpdate: () => c.drag?.update(),
      onComplete: () => {
        c.drag?.update();
        done?.();
      },
    });
  };

  const addToRanking = (c: CardRefs): void => {
    const r = rows.get(c.a.id);
    if (!r) return;
    inRanking.add(c.a.id);
    rows.forEach((o) => {
      if (o !== r && o.li.dataset['open'] === 'true') setOpen(o, false);
    });
    setOpen(r, true);
    refresh({ roll: true, entering: c.a.id });
    // A soft wash on the new row, so the eye finds it.
    const wash = getComputedStyle(root).getPropertyValue('--color-primary-50').trim() || '#F5F1FF';
    if (!reduced()) gsap.fromTo(r.btn, { backgroundColor: wash }, { backgroundColor: 'rgba(255,255,255,0)', duration: 1.6, ease: 'power2.out', clearProps: 'backgroundColor' });
    const place = [...rank(visibleIds(), active)].indexOf(c.a.id) + 1;
    announce(`${c.a.name} screened. Job Fit ${score(c.a, active)}, ranked ${ordinal(place)}.`);
    settleScroll();
  };

  const screen = (id: string): void => {
    const c = cards.get(id);
    if (!c || c.state !== 'idle') return;
    c.state = 'screening';
    c.card.dataset['state'] = 'screening';
    c.btn.disabled = true;
    c.status.textContent = copy.screening;
    c.drag?.disable();
    const target = score(c.a, active);
    const o = { p: 0 };
    spring(c);
    const finish = (): void => {
      setRing(c, target);
      c.ring?.setAttribute('aria-label', `Job Fit Score ${target} out of 100`);
      c.status.textContent = `Job Fit ${target}`;
      const leave = (): void => {
        c.state = 'done';
        c.card.dataset['state'] = 'done';
        c.slot.dataset['done'] = 'true';
        gsap.set(c.card, { clearProps: 'opacity,y,scale' });
        updateTray();
        addToRanking(c);
      };
      if (reduced()) return leave();
      later(() => gsap.to(c.card, { opacity: 0, y: -10, scale: 0.97, duration: 0.3, ease: 'power2.in', onComplete: leave }), 380);
    };
    if (reduced()) return finish();
    gsap.to(o, { p: target, duration: 1.1, delay: 0.15, ease: 'power2.out', onUpdate: () => setRing(c, o.p), onComplete: finish });
  };

  cards.forEach((c) => {
    c.btn.addEventListener('click', () => screen(c.a.id), { signal });
  });

  const reset = (): void => {
    const state = Flip.getState(visibleLis());
    cards.forEach((c) => {
      gsap.killTweensOf(c.card);
      c.state = 'idle';
      c.card.dataset['state'] = 'idle';
      delete c.slot.dataset['done'];
      c.btn.disabled = false;
      c.status.textContent = copy.notScreened;
      gsap.set(c.card, { clearProps: 'all' });
      resetRing(c);
      c.drag?.enable();
      c.drag?.update();
      const r = rows.get(c.a.id);
      if (r) {
        inRanking.delete(c.a.id);
        r.li.hidden = true;
        setOpen(r, false);
      }
      if (!reduced()) gsap.fromTo(c.card, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', clearProps: 'opacity,transform' });
    });
    const order = rank(visibleIds(), active);
    order.forEach((id, i) => {
      const r = rows.get(id);
      if (!r) return;
      r.rankEl.textContent = String(i + 1);
      list.append(r.li);
    });
    rows.forEach((r) => {
      if (!inRanking.has(r.a.id)) list.append(r.li);
    });
    Flip.from(state, { duration: reduced() ? 0 : 0.6, ease: 'power3.out', absolute: false });
    updateTray();
    announce('Applications reset.');
    settleScroll();
  };
  must<HTMLButtonElement>(trayDone, '[data-reset]').addEventListener('click', reset, { signal });

  /* ---------- drag a resume onto the ranking ---------- */
  const draggables: Draggable[] = [];
  const unholds: (() => void)[] = [];
  cards.forEach((c) => {
    let settled = true;
    const settle = (): void => {
      const d = c.drag;
      if (settled || !d) return;
      settled = true;
      const hit = d.hitTest(ranking, '40%');
      delete root.dataset['dragging'];
      delete ranking.dataset['over'];
      c.card.dataset['grabbed'] = 'false';
      delete c.slot.dataset['lifted'];
      if (hit && c.state === 'idle') screen(c.a.id);
      else spring(c);
    };
    const d = Draggable.create(c.card, {
      type: 'x,y',
      bounds: figure,
      edgeResistance: 0.7,
      inertia: !reduced(),
      dragClickables: false,
      zIndexBoost: false,
      onPress() {
        settled = false;
        gsap.killTweensOf(c.card);
        c.slot.dataset['lifted'] = 'true';
        c.card.dataset['grabbed'] = 'true';
        if (!reduced()) gsap.to(c.card, { scale: 1.03, duration: 0.3, ease: 'expo.out' });
      },
      onDragStart() {
        root.dataset['dragging'] = 'true';
      },
      onDrag() {
        ranking.dataset['over'] = this.hitTest(ranking, '40%') ? 'true' : 'false';
      },
      onRelease() {
        if (!reduced()) gsap.to(c.card, { scale: 1, duration: 0.4, ease: 'expo.out' });
        
        window.setTimeout(() => {
          if (!c.drag?.isThrowing) settle();
        }, 0);
      },
      onThrowComplete() {
        settle();
      },
    })[0];
    if (d) {
      c.drag = d;
      draggables.push(d);
      unholds.push(holdToDrag(c.card, d));
    }
  });

  /* ---------- intro: the cards fan out of a stack, once, and always end side by side ---------- */
  const ctx = gsap.context(() => {
    if (reduced()) return;
    const slots = [...cards.values()].map((c) => c.slot);
    const first = slots[0];
    if (first) {
      const stack = (s: HTMLElement): { x: number; y: number } => ({
        x: trayCards.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2),
        y: first.offsetTop - s.offsetTop,
      });
      const fan = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1.1 }, onComplete: () => void gsap.set(slots, { clearProps: 'transform' }) });
      slots.forEach((s, i) => {
        fan.fromTo(
          s,
          { x: () => stack(s).x + (i - 0.5) * 6, y: () => stack(s).y + i * 8, rotation: i === 0 ? -5 : 4, scale: 0.96, transformOrigin: '50% 90%' },
          { x: 0, y: 0, rotation: 0, scale: 1 },
          i * 0.08,
        );
      });
      ScrollTrigger.create({
        trigger: tray,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          fan.invalidate();
          fan.play(0);
        },
      });
    }
  }, root);

  /* ---------- cleanup ---------- */
  return () => {
    ac.abort();
    timers.forEach((t) => window.clearTimeout(t));
    window.clearTimeout(liveTimer);
    window.clearTimeout(hintTimer);
    window.clearTimeout(refreshTimer);
    unholds.forEach((fn) => fn());
    draggables.forEach((d) => d.kill());
    ctx.revert();
    const targets: Element[] = [...rows.values()].flatMap((r) => [r.li, r.bar, r.btn]);
    cards.forEach((c) => targets.push(c.card, c.slot));
    gsap.killTweensOf(targets);
    rows.forEach((r) => gsap.killTweensOf(r.n));
    Flip.killFlipsOf(targets);
  };
}

export function initScreeningLab(): void {
  onReady(() => {
    const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-screening-lab]'));
    const cleanups = roots.map(mount);
    return () => cleanups.forEach((fn) => fn());
  });
}
