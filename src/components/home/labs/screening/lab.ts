/**
 * ScreeningLab animation. It plays by itself, once, when the ranking scrolls into view: the job's
 * remaining requirements light up one after another, the scores roll and the list re-sorts with Flip
 * each time, then a new application arrives and is scored. Every number comes from model.ts.
 * Scoped to its root; cleans up every timeline, tween and ScrollTrigger it makes.
 * Without JS the page shows the start state; under reduced motion it shows the final state.
 */
import { gsap, ScrollTrigger, onReady, prefersReducedMotion } from '../../../../scripts/motion';
import { Flip } from 'gsap/Flip';
import { copy } from './copy';
import { APPLICANTS, REQS, band, breakdown, defaultActive, rank, score, type Applicant, type Item, type ReqId } from './model';

gsap.registerPlugin(Flip, ScrollTrigger);

const byId = new Map(APPLICANTS.map((a) => [a.id, a]));

interface RowRefs {
  a: Applicant;
  li: HTMLElement;
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

const must = <T extends Element>(scope: ParentNode, sel: string): T => {
  const el = scope.querySelector<T>(sel);
  if (!el) throw new Error(`ScreeningLab: missing ${sel}`);
  return el;
};

function mount(root: HTMLElement): () => void {
  const reduced = prefersReducedMotion();
  const list = must<HTMLElement>(root, '[data-list]');
  const status = must<HTMLElement>(root, '[data-status]');
  const tplMatched = must<HTMLTemplateElement>(root, '[data-tpl="matched"]');
  const tplMissing = must<HTMLTemplateElement>(root, '[data-tpl="missing"]');
  const hint = status.textContent ?? '';
  const chips = new Map<ReqId, HTMLElement>();
  root.querySelectorAll<HTMLElement>('[data-req]').forEach((c) => chips.set(c.dataset['req'] as ReqId, c));

  const active = defaultActive();

  /* ---------- refs ---------- */
  const rows = new Map<string, RowRefs>();
  list.querySelectorAll<HTMLElement>('[data-row]').forEach((li) => {
    const a = byId.get(li.dataset['id'] ?? '');
    if (!a) return;
    rows.set(a.id, {
      a,
      li,
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
  const inRanking = new Set<string>([...rows.values()].filter((r) => !r.li.hidden).map((r) => r.a.id));
  const visibleIds = (): string[] => [...inRanking];

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
    r.label.textContent = copy[band(to)];
    if (reduced) {
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

  /** Recompute scores, re-sort the DOM and animate the move with Flip. */
  const refresh = (opts: { entering?: string } = {}): void => {
    const order = rank(visibleIds(), active);
    const enteringLi = opts.entering ? rows.get(opts.entering)?.li : undefined;
    const before = Array.from(list.children).filter((el) => !(el as HTMLElement).hidden && el !== enteringLi);
    const state = Flip.getState(before, { props: 'opacity' });
    if (enteringLi) enteringLi.hidden = false;

    order.forEach((id, i) => {
      const r = rows.get(id);
      if (!r) return;
      paintDetails(r);
      rollTo(r, score(r.a, active), id === opts.entering ? 0 : undefined);
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
        duration: reduced ? 0 : 0.7,
        ease: 'power3.out',
        stagger: reduced ? 0 : 0.025,
        absolute: false,
        onEnter: (els: Element[]) =>
          gsap.fromTo(els, { opacity: 0, y: -14, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: reduced ? 0 : 0.55, ease: 'expo.out', clearProps: 'transform,opacity' }),
        onLeave: (els: Element[]) => gsap.to(els, { opacity: 0, duration: reduced ? 0 : 0.25, ease: 'power2.out' }),
      });
    }
  };

  /* ---------- the open row, the lit requirement, the status line ---------- */
  let refreshTimer = 0;
  const settleScroll = (): void => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), reduced ? 50 : 520);
  };
  const openOnly = (id: string | undefined): void => {
    rows.forEach((r) => {
      const open = r.a.id === id;
      r.li.dataset['open'] = open ? 'true' : 'false';
      r.panel.toggleAttribute('inert', !open);
    });
    settleScroll();
  };
  const first = (): string | undefined => rank(visibleIds(), active)[0];

  const light = (id: ReqId): void => {
    const chip = chips.get(id);
    if (!chip) return;
    active.add(id);
    chip.dataset['on'] = 'true';
    const state = chip.querySelector('[data-chip-state]');
    if (state) state.textContent = `, ${copy.counted}`;
    if (!reduced) gsap.fromTo(chip, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'back.out(2.4)', clearProps: 'transform' });
  };
  const say = (text: string): void => void (status.textContent = text);
  const labelOf = (id: ReqId): string => REQS.find((r) => r.id === id)?.label ?? id;

  /* ---------- start state, then the sequence ---------- */
  rows.forEach((r) => {
    r.n.v = score(r.a, active);
    gsap.set(r.bar, { scaleX: r.n.v / 100 });
  });
  root.setAttribute('data-ready', '');
  openOnly(first());

  const later = REQS.filter((r) => !active.has(r.id)).map((r) => r.id);
  const fresh = [...rows.values()].find((r) => r.li.hidden)?.a.id;

  if (reduced) {
    later.forEach(light);
    if (fresh) inRanking.add(fresh);
    refresh(fresh ? { entering: fresh } : {});
    openOnly(first());
    return () => window.clearTimeout(refreshTimer);
  }

  const tl = gsap.timeline({ paused: true });
  let t = 0.5;
  later.forEach((id) => {
    tl.call(
      () => {
        say(`${copy.addingRequirement} ${labelOf(id)}.`);
        light(id);
        refresh();
        openOnly(first());
      },
      undefined,
      t,
    );
    t += 3;
  });
  if (fresh) {
    const a = rows.get(fresh)?.a;
    tl.call(
      () => {
        inRanking.add(fresh);
        refresh({ entering: fresh });
        openOnly(fresh);
        say(`${copy.newApplication} ${a?.name ?? ''}, ${a ? score(a, active) : ''}.`);
      },
      undefined,
      t,
    );
    t += 3.4;
  }
  tl.call(
    () => {
      say(hint);
      openOnly(first());
    },
    undefined,
    t,
  );

  const st = ScrollTrigger.create({ trigger: list, start: 'top 68%', once: true, onEnter: () => void tl.play(0) });

  return () => {
    st.kill();
    tl.kill();
    window.clearTimeout(refreshTimer);
    const targets: Element[] = [...rows.values()].flatMap((r) => [r.li, r.bar]);
    chips.forEach((c) => targets.push(c));
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
