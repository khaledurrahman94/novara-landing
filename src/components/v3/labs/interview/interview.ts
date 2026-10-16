/**
 * InterviewLab behaviour.
 *
 * Scrubbed intro (pinned from 768px): the page opens zoomed into the interviewer tile, captions type as you
 * scroll, and the full interview UI zooms out. Once it is out, the demo is live.
 *
 * Detections are real browser events and run only while the demo is live and on screen:
 *  - tab switch (visibilitychange), focus lost (window blur/focus), question copied (copy),
 *    pasted answer (paste), left full screen (fullscreenchange), looking away (pointer outside the window for 2s,
 *    fine pointers only), plus simulated camera off and second face (switches, no camera access).
 * No network, no storage. Every listener is removed on cleanup.
 */
import { gsap, ScrollTrigger, onReady, prefersReducedMotion, getLenis } from '../../../../scripts/motion';
import { kinds, lab, clock, span, type Kind } from './copy';

gsap.registerPlugin(ScrollTrigger);

interface Ev {
  kind: Kind;
  /** Demo clock (ms) when it happened. */
  at: number;
  detail: string;
  simulated: boolean;
}
interface Mark { t: number; p: number }

const EASE = 'expo.out';
const AWAY_MS = 2000;
const SCROLL_LEAVE_MS = 250;
const MIN_BLUR_MS = 250;
const TOTAL = lab.questions.length;
const meta = (k: Kind) => kinds.find((m) => m.key === k);
const tagOf = (e: Ev): string => (e.simulated ? lab.simTag : e.kind === 'away' ? lab.cursorTag : '');
const titleOf = (e: Ev): string => `${meta(e.kind)?.title ?? e.kind}${e.detail ? `, ${e.detail}` : ''}`;

function mount(root: HTMLElement): () => void {
  const rm = prefersReducedMotion();
  const q = <T extends HTMLElement = HTMLElement>(sel: string, from: ParentNode = root): T => {
    const el = from.querySelector<T>(sel);
    if (!el) throw new Error(`InterviewLab: missing ${sel}`);
    return el;
  };
  const qa = (sel: string, from: ParentNode = root): HTMLElement[] => Array.from(from.querySelectorAll<HTMLElement>(sel));

  const pin = q('[data-il-pin]');
  const win = q('[data-il-window]');
  const zoom = q('[data-il-zoom]');
  const liveView = q('[data-il-live]');
  const reportView = q('[data-il-report]');
  const frameWrap = q('[data-il-frame]');
  const frame = q('[data-card="interview-frame"]', frameWrap);
  const caption = q('[data-anim="caption"]', frame);
  const waveEl = q('[data-anim="wave"]', frame);
  const bars = qa('[data-anim="wave-bar"]', frame);
  const timerHost = frame.querySelector('.tabular-nums');
  const timerNode = timerHost?.lastChild ?? null;
  const warn = q('[data-il-warn]');
  const toast = q('[data-il-toast]');
  const toastText = q('[data-il-toast-text]');
  const flag = q('[data-il-flag]');
  const flagText = q('[data-il-flag-text]');
  const selfOv = q('[data-il-self]');
  const selfCam = q('[data-il-self-cam]');
  const selfFaces = q('[data-il-self-faces]');
  const step = q('[data-il-step]');
  const dots = qa('[data-il-dot]');
  const answer = q<HTMLTextAreaElement>('[data-il-answer]');
  const nextBtn = q<HTMLButtonElement>('[data-il-next]');
  const finishBtn = q<HTMLButtonElement>('[data-il-finish]');
  const fsBtn = q<HTMLButtonElement>('[data-il-fs]');
  const fsText = q('[data-il-fs-text]');
  const chip = q('[data-il-chip]');
  const chipText = q('[data-il-chip-text]');
  const timeline = q('[data-il-timeline]');
  const empty = q('[data-il-empty]');
  const status = q('[data-il-status]');
  const cue = q('[data-il-cue]');
  const fades = qa('[data-il-fade]');
  const sims = qa('[data-il-sim]');
  const tiles = new Map<Kind, HTMLElement>(kinds.map((k) => [k.key, q(`[data-il-tile="${k.key}"]`)]));
  const counters = new Map<Kind, HTMLElement>(kinds.map((k) => [k.key, q(`[data-il-count="${k.key}"]`)]));
  const rTimeline = q('[data-il-rtimeline]', reportView);
  const rSummary = q('[data-il-summary]', reportView);
  const rChip = q('[data-il-rchip]', reportView);
  const rChipText = q('[data-il-rchip-text]', reportView);
  const rTitle = q('[data-il-report-title]', reportView);
  const again = q('[data-il-again]', reportView);

  const fine = window.matchMedia('(pointer: fine)').matches;
  const fsOk = typeof document.fullscreenEnabled === 'boolean' && document.fullscreenEnabled && typeof win.requestFullscreen === 'function';
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void): void => {
    el.addEventListener(type, fn);
    cleanups.push(() => el.removeEventListener(type, fn));
  };

  /* ---------- state ---------- */
  let phase: 'idle' | 'running' | 'report' = 'idle';
  let introDone = rm;
  let inView = false;
  let qi = 0;
  let events: Ev[] = [];
  let counts = new Map<Kind, number>();
  let clockBase = 0;
  let clockStart: number | null = null;
  let tick: ReturnType<typeof setInterval> | undefined;
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  let speaking = false;
  let simCamera = false;
  let simFaces = false;
  // detection trackers
  let hidden: Mark | null = null;
  let blurred: Mark | null = null;
  let blurIsTab = false;
  let awayMark: Mark | null = null;
  let awayTimer: ReturnType<typeof setTimeout> | undefined;
  let inFs = false;
  let quietFs = false;
  let lastScroll = -1e9;
  let typeTween: gsap.core.Tween | null = null;
  let skipIntro: (() => void) | null = null;

  const isLive = (): boolean => phase === 'running' && introDone && inView;
  const now = (): number => clockBase + (clockStart === null ? 0 : performance.now() - clockStart);
  const mark = (): Mark => ({ t: now(), p: performance.now() });
  const setTimer = (): void => {
    if (timerNode) timerNode.textContent = clock(now());
  };

  /* ---------- waveform: moves only while live ---------- */
  const waves = rm
    ? []
    : bars.map((b) =>
        gsap.to(b, {
          scaleY: () => (speaking ? gsap.utils.random(0.3, 1) : gsap.utils.random(0.1, 0.3)),
          duration: () => gsap.utils.random(0.28, 0.55),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          paused: true,
        }),
      );

  /* ---------- caption ---------- */
  const typeCaption = (text: string): void => {
    typeTween?.kill();
    typeTween = null;
    if (rm) {
      caption.textContent = text;
      return;
    }
    const o = { n: 0 };
    speaking = true;
    typeTween = gsap.to(o, {
      n: text.length,
      duration: Math.min(2.8, Math.max(0.9, text.length * 0.03)),
      ease: 'none',
      onUpdate: () => void (caption.textContent = text.slice(0, Math.round(o.n))),
      onComplete: () => {
        speaking = false;
        typeTween = null;
      },
    });
  };

  /* ---------- panel: counters, chip, timeline ---------- */
  const total = (): number => events.length;
  const flip = (el: HTMLElement, value: number): void => {
    if (rm) {
      el.textContent = String(value);
      return;
    }
    gsap
      .timeline()
      .to(el, { yPercent: -60, opacity: 0, duration: 0.15, ease: 'power2.in' })
      .add(() => void (el.textContent = String(value)))
      .fromTo(el, { yPercent: 60 }, { yPercent: 0, opacity: 1, duration: 0.25, ease: EASE });
  };

  const rowEl = (time: string, label: string, flagged: boolean, tag: string, last: boolean): HTMLLIElement => {
    const li = document.createElement('li');
    li.className = 'relative flex gap-2.5 pb-3 last:pb-0';
    if (!last) {
      const line = document.createElement('span');
      line.className = 'absolute left-[5px] top-4 h-full w-px bg-border-secondary';
      line.setAttribute('aria-hidden', 'true');
      li.append(line);
    }
    const dot = document.createElement('span');
    dot.dataset['dot'] = '';
    dot.className = `relative mt-1 size-[11px] shrink-0 rounded-full border-2 bg-bg-secondary ${flagged ? 'border-warning' : 'border-border-primary'}`;
    dot.setAttribute('aria-hidden', 'true');
    const body = document.createElement('span');
    body.className = 'min-w-0 flex-1 text-[13px]';
    const t = document.createElement('span');
    t.className = 'mr-2 tabular-nums text-text-tertiary';
    t.textContent = time;
    const l = document.createElement('span');
    l.className = flagged ? 'font-semibold text-text-primary' : 'text-text-secondary';
    l.textContent = label;
    body.append(t, l);
    if (tag) {
      const s = document.createElement('span');
      s.className = 'ml-2 rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-text-secondary';
      s.textContent = tag;
      body.append(s);
    }
    if (flagged) {
      const f = document.createElement('span');
      f.className = 'mt-0.5 block text-xs text-text-tertiary';
      f.textContent = lab.flagged;
      body.append(f);
    }
    li.append(dot, body);
    return li;
  };

  const sorted = (): Ev[] => [...events].sort((a, b) => a.at - b.at);

  const renderTimeline = (animateLast: boolean): void => {
    const list = sorted();
    const shown = list.slice(-3);
    const hiddenCount = list.length - shown.length;
    timeline.replaceChildren();
    const items: HTMLLIElement[] = [];
    const rows: { time: string; label: string; flagged: boolean; tag: string }[] = [{ time: clock(0), label: lab.started, flagged: false, tag: '' }];
    shown.forEach((e) => rows.push({ time: clock(e.at), label: titleOf(e), flagged: true, tag: tagOf(e) }));
    rows.forEach((r, i) => {
      const li = rowEl(r.time, r.label, r.flagged, r.tag, i === rows.length - 1 && hiddenCount === 0);
      items.push(li);
      timeline.append(li);
      if (i === 0 && hiddenCount > 0) {
        const more = document.createElement('li');
        more.className = 'mb-2 pl-[21px] text-xs text-text-tertiary';
        more.textContent = lab.earlier(hiddenCount);
        timeline.append(more);
      }
    });
    empty.hidden = list.length > 0;
    const last = items[items.length - 1];
    if (animateLast && last && !rm) {
      gsap.from(last, { y: 10, opacity: 0, duration: 0.6, ease: EASE });
      const dot = last.querySelector<HTMLElement>('[data-dot]');
      if (dot) gsap.from(dot, { scale: 0, duration: 0.5, ease: 'back.out(2.4)' });
    }
  };

  const renderChip = (): void => {
    chipText.textContent = lab.review(total());
    chip.dataset['n'] = total() > 0 ? 'hit' : '0';
  };

  const renderSim = (): void => {
    const camOn = simCamera;
    const facesOn = simFaces;
    selfCam.hidden = !camOn;
    selfFaces.hidden = camOn || !facesOn;
    selfOv.dataset['on'] = camOn || facesOn ? 'true' : 'false';
    const parts: string[] = [];
    if (camOn) parts.push(lab.overlay.cameraFrame);
    if (facesOn) parts.push(lab.overlay.facesFrame);
    if (parts.length) flagText.textContent = parts.join(', ');
    flag.dataset['on'] = parts.length ? 'true' : 'false';
    sims.forEach((s) => s.setAttribute('aria-checked', String(s.dataset['ilSim'] === 'camera' ? camOn : facesOn)));
  };

  const resetPanel = (): void => {
    counts = new Map();
    events = [];
    simCamera = false;
    simFaces = false;
    kinds.forEach((k) => {
      const c = counters.get(k.key);
      const t = tiles.get(k.key);
      if (c) {
        gsap.killTweensOf(c);
        gsap.set(c, { clearProps: 'transform,opacity' });
        c.textContent = '0';
      }
      if (t) t.dataset['hit'] = 'false';
    });
    renderChip();
    renderTimeline(false);
    renderSim();
    warn.style.opacity = '0';
    gsap.killTweensOf([toast, warn]);
    gsap.set(toast, { opacity: 0 });
    gsap.set(warn, { opacity: 0 });
  };

  /* ---------- the one event pipeline ---------- */
  const emit = (kind: Kind, detail = '', simulated = false, at?: number): void => {
    if (!isLive()) return;
    const ev: Ev = { kind, at: at ?? now(), detail, simulated };
    events.push(ev);
    const n = (counts.get(kind) ?? 0) + 1;
    counts.set(kind, n);

    const c = counters.get(kind);
    const tile = tiles.get(kind);
    if (c) flip(c, n);
    if (tile) {
      tile.dataset['hit'] = 'true';
      if (!rm) gsap.fromTo(tile, { scale: 1.05 }, { scale: 1, duration: 0.55, ease: EASE });
    }
    renderChip();
    renderTimeline(true);

    const text = titleOf(ev);
    toastText.textContent = `${lab.toast}: ${text}`;
    clearTimeout(toastTimer);
    gsap.killTweensOf(toast);
    if (rm) gsap.set(toast, { opacity: 1, y: 0 });
    else gsap.fromTo(toast, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' });
    toastTimer = setTimeout(() => gsap.to(toast, { opacity: 0, y: -6, duration: rm ? 0 : 0.3, ease: 'power2.in' }), 3200);

    // The frame takes a warning border; the interviewer's voice stutters.
    gsap.killTweensOf(warn);
    if (rm) {
      gsap.set(warn, { opacity: 1 });
      gsap.to(warn, { opacity: 0, duration: 0, delay: 1.2 });
    } else {
      gsap.fromTo(warn, { opacity: 1 }, { opacity: 0, duration: 1.4, ease: 'power2.out' });
      gsap.fromTo(waveEl, { scaleY: 0.12 }, { scaleY: 1, duration: 0.7, ease: EASE, overwrite: true });
    }
    status.textContent = lab.announce(text, total());
  };

  /* ---------- clock and liveness ---------- */
  const resetTrackers = (): void => {
    hidden = null;
    blurred = null;
    blurIsTab = false;
    awayMark = null;
    clearTimeout(awayTimer);
  };

  const sync = (): void => {
    if (phase === 'idle' && introDone && inView) begin();
    const live = isLive();
    if (live && clockStart === null) {
      clockStart = performance.now();
      tick = setInterval(setTimer, 500);
      waves.forEach((w) => w.play());
    } else if (!live && clockStart !== null) {
      clockBase += performance.now() - clockStart;
      clockStart = null;
      clearInterval(tick);
      waves.forEach((w) => w.pause());
      setTimer();
      resetTrackers();
    }
  };

  /* ---------- the interview ---------- */
  const showQuestion = (i: number): void => {
    qi = i;
    step.textContent = lab.step(i + 1, TOTAL);
    dots.forEach((d, n) => (d.dataset['on'] = String(n <= i)));
    answer.value = '';
    const lastQ = i === TOTAL - 1;
    nextBtn.hidden = lastQ;
    finishBtn.className = `il-btn ${lastQ ? 'il-btn-primary' : 'il-btn-secondary'}`;
    const text = lab.questions[i] ?? '';
    typeCaption(text);
    if (i > 0 || phase !== 'idle') status.textContent = `${lab.step(i + 1, TOTAL)}. ${text}`;
  };

  function begin(): void {
    phase = 'running';
    clockBase = 0;
    clockStart = null;
    resetPanel();
    setTimer();
    showQuestion(0);
  }

  const exitFs = (): void => {
    if (document.fullscreenElement === win) {
      quietFs = true;
      void document.exitFullscreen().catch(() => undefined);
    }
  };

  const finish = (): void => {
    if (phase !== 'running') return;
    // Close out anything still open, then stop the clock.
    const end = now();
    exitFs();
    typeTween?.kill();
    phase = 'report';
    sync();

    const list = sorted();
    kinds.forEach((k) => {
      const n = counts.get(k.key) ?? 0;
      const li = q(`[data-il-rkind="${k.key}"]`, reportView);
      const v = q('[data-il-rcount]', li);
      v.textContent = String(n);
      v.className = `font-semibold tabular-nums ${n > 0 ? 'text-text-primary' : 'text-text-tertiary'}`;
    });
    const n = list.length;
    rSummary.textContent = n > 0 ? lab.report.summary(n) : lab.report.clean;
    rChipText.textContent = lab.review(n);
    rChip.className = `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-text-secondary ${n > 0 ? 'bg-warning/10' : 'bg-gray-100'}`;
    const dot = q('span', rChip);
    dot.className = `size-1.5 rounded-full ${n > 0 ? 'bg-warning' : 'bg-gray-400'}`;
    rTimeline.replaceChildren();
    const rows = [
      { time: clock(0), label: lab.started, flagged: false, tag: '' },
      ...list.map((e) => ({ time: clock(e.at), label: titleOf(e), flagged: true, tag: tagOf(e) })),
      { time: clock(end), label: lab.ended, flagged: false, tag: '' },
    ];
    rows.forEach((r, i) => rTimeline.append(rowEl(r.time, r.label, r.flagged, r.tag, i === rows.length - 1)));

    reportView.style.minHeight = `${liveView.offsetHeight}px`;
    liveView.hidden = true;
    reportView.hidden = false;
    renderSim();
    status.textContent = `${lab.report.title}. ${n > 0 ? lab.report.summary(n) : lab.report.clean}`;
    rTitle.focus({ preventScroll: true });

    // The sample scoring panel plays in; the visitor's report rows rise.
    const score = q('[data-card="interview-score"]', reportView);
    const num = q('[data-anim="count"]', score);
    const barEls = qa('[data-anim="bar"]', score);
    if (!rm) {
      const o = { v: 0 };
      gsap.fromTo(reportView.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: EASE });
      gsap.fromTo(rTimeline.children, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.25, ease: EASE });
      gsap.fromTo(barEls, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.1, delay: 0.4, ease: EASE });
      gsap.to(o, { v: Number(num.dataset['count'] ?? 0), duration: 1.2, delay: 0.3, ease: 'power3.out', onUpdate: () => void (num.textContent = String(Math.round(o.v))) });
    }
    ScrollTrigger.refresh();
  };

  const restart = (): void => {
    reportView.hidden = true;
    reportView.style.minHeight = '';
    liveView.hidden = false;
    phase = 'idle';
    sync();
    if (!rm) gsap.fromTo(liveView, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE, clearProps: 'transform,opacity' });
    ScrollTrigger.refresh();
    (nextBtn.hidden ? finishBtn : nextBtn).focus({ preventScroll: true });
  };

  on(nextBtn, 'click', () => {
    if (phase === 'running' && qi < TOTAL - 1) showQuestion(qi + 1);
  });
  on(finishBtn, 'click', finish);
  on(again, 'click', restart);

  /* ---------- detections ---------- */
  const onVisibility = (): void => {
    if (document.hidden) {
      if (isLive() && !hidden) {
        hidden = mark();
        if (blurred) blurIsTab = true;
      }
      return;
    }
    const h = hidden;
    hidden = null;
    if (h) {
      emit('tab', `${span(performance.now() - h.p)} away`, false, h.t);
      if (blurred) blurIsTab = true;
    }
    if (blurIsTab) {
      blurred = null;
      blurIsTab = false;
    }
  };
  const onBlur = (): void => {
    if (!isLive() || blurred) return;
    blurred = mark();
    if (document.hidden || hidden) blurIsTab = true;
  };
  const onFocus = (): void => {
    const b = blurred;
    if (!b) return;
    blurred = null;
    if (blurIsTab) {
      blurIsTab = false;
      return;
    }
    const dur = performance.now() - b.p;
    if (dur >= MIN_BLUR_MS) emit('focus', span(dur), false, b.t);
  };
  const onCopy = (): void => {
    if (!isLive()) return;
    const sel = document.getSelection();
    const node = sel?.anchorNode ?? null;
    if (!sel || sel.isCollapsed || !node) return;
    const el = node instanceof Element ? node : node.parentElement;
    if (el && frameWrap.contains(el)) emit('copy');
  };
  const onPaste = (e: ClipboardEvent): void => {
    const len = e.clipboardData?.getData('text')?.length ?? 0;
    emit('paste', len > 0 ? `${len} characters` : '');
  };
  const onFsChange = (): void => {
    const nowIn = document.fullscreenElement === win;
    fsText.textContent = nowIn ? lab.exitFullscreen : lab.fullscreen;
    if (inFs && !nowIn) {
      if (quietFs) quietFs = false;
      else emit('fullscreen');
    }
    inFs = nowIn;
    ScrollTrigger.refresh();
  };
  const onScroll = (): void => {
    lastScroll = performance.now();
    // A leave that the scroll itself caused is not the visitor looking away.
    if (awayMark && awayTimer !== undefined && lastScroll - awayMark.p < SCROLL_LEAVE_MS) onEnter();
  };
  const onLeave = (e: PointerEvent): void => {
    if (!fine || e.pointerType === 'touch' || !isLive() || awayMark) return;
    if (performance.now() - lastScroll < SCROLL_LEAVE_MS) return;
    awayMark = mark();
    awayTimer = setTimeout(() => {
      awayTimer = undefined;
      if (awayMark) emit('away', 'over 2s', false, awayMark.t);
    }, AWAY_MS);
  };
  const onEnter = (): void => {
    clearTimeout(awayTimer);
    awayTimer = undefined;
    awayMark = null;
  };

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  document.addEventListener('copy', onCopy);
  document.addEventListener('fullscreenchange', onFsChange);
  window.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('pointerleave', onLeave);
  win.addEventListener('pointerenter', onEnter);
  answer.addEventListener('paste', onPaste);
  cleanups.push(() => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('copy', onCopy);
    document.removeEventListener('fullscreenchange', onFsChange);
    window.removeEventListener('scroll', onScroll);
    win.removeEventListener('pointerleave', onLeave);
    win.removeEventListener('pointerenter', onEnter);
    answer.removeEventListener('paste', onPaste);
  });

  if (fsOk) {
    on(fsBtn, 'click', () => {
      if (document.fullscreenElement === win) exitFs();
      else void win.requestFullscreen().catch(() => undefined);
    });
  } else {
    fsBtn.hidden = true;
    root.dataset['fs'] = 'off';
  }

  // Simulated checks: switches only. The camera is never accessed.
  sims.forEach((s) =>
    on(s, 'click', () => {
      if (!isLive()) return;
      const camera = s.dataset['ilSim'] === 'camera';
      const next = camera ? !simCamera : !simFaces;
      if (camera) simCamera = next;
      else simFaces = next;
      renderSim();
      if (next) emit(camera ? 'camera' : 'faces', '', true);
    }),
  );

  /* ---------- visibility of the lab ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      sync();
    },
    // Viewport-relative: still reachable when the stacked window is taller than the screen.
    { threshold: 0, rootMargin: '-25% 0px -25% 0px' },
  );
  io.observe(win);
  cleanups.push(() => io.disconnect());

  /* ---------- scrubbed intro ---------- */
  const setIntro = (done: boolean): void => {
    if (introDone === done) return;
    introDone = done;
    if (done) delete root.dataset['intro'];
    else root.dataset['intro'] = '';
    sync();
  };

  const mm = gsap.matchMedia();
  if (rm) {
    caption.textContent = lab.intro;
  } else {
    root.dataset['intro'] = '';
    introDone = false;
    caption.textContent = '';
    const frameBox = () => {
      const fw = frameWrap.offsetWidth;
      const fh = frameWrap.offsetHeight;
      const cx = frameWrap.offsetLeft + fw / 2;
      const cy = frameWrap.offsetTop + fh / 2;
      return { fw, fh, cx, cy };
    };
    const build = (pinned: boolean): (() => void) => {
      const m = () => {
        const b = frameBox();
        if (!pinned) return { s: 1.08, x: 0, y: 0, o: `${b.cx}px ${b.cy}px` };
        const s = Math.min(Math.max(Math.min(zoom.offsetWidth / b.fw, zoom.offsetHeight / b.fh), 1.15), 2.6);
        return { s, x: zoom.offsetWidth / 2 - b.cx, y: zoom.offsetHeight / 2 - b.cy, o: `${b.cx}px ${b.cy}px` };
      };
      const typed = { n: 0 };
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          const p = tl.progress();
          setIntro(p >= 0.985);
          // Scrolling back below the hand-over point: the scrub alone owns the caption again.
          if (p < 0.5 && typeTween) {
            typeTween.kill();
            typeTween = null;
            speaking = false;
          }
          // Before the interview starts, the intro caption types with the scroll.
          if (phase === 'idle' || p < 0.5) {
            caption.textContent = lab.intro.slice(0, Math.round(typed.n));
          } else if (phase === 'running' && !typeTween) {
            caption.textContent = lab.questions[qi] ?? '';
          }
        },
        scrollTrigger: pinned
          ? {
              trigger: pin,
              start: () => (pin.offsetHeight <= window.innerHeight - 96 ? 'center center' : 'top 72px'),
              end: () => `+=${Math.round(window.innerHeight * 1.1)}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              refreshPriority: 2,
              invalidateOnRefresh: true,
            }
          : { trigger: win, start: 'top 82%', end: 'top 30%', scrub: 0.6, invalidateOnRefresh: true },
      });
      const st = tl.scrollTrigger;
      tl.fromTo(
        zoom,
        { x: () => m().x, y: () => m().y, scale: () => m().s, transformOrigin: () => m().o },
        { x: 0, y: 0, scale: 1, transformOrigin: () => m().o, ease: 'power2.inOut', duration: 1 },
        0,
      );
      tl.to(typed, { n: lab.intro.length, duration: 0.5, ease: 'none' }, 0.02);
      tl.fromTo(fades, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.08 }, 0.6);
      tl.to(cue, { opacity: 0, duration: 0.2 }, 0);
      skipIntro = () => {
        if (!st) return;
        const y = st.end;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
      };
      return () => {
        skipIntro = null;
        setIntro(true);
        gsap.set([zoom, ...fades, cue], { clearProps: 'all' });
      };
    };
    mm.add('(min-width: 768px) and (min-height: 620px)', () => build(true));
    mm.add('(max-width: 767px), (max-height: 619px)', () => build(false));
  }
  // A keyboard user tabbing into the zoomed-out UI jumps straight to the finished state.
  const onFocusIn = (): void => {
    if (!introDone) skipIntro?.();
  };
  root.addEventListener('focusin', onFocusIn);
  cleanups.push(() => root.removeEventListener('focusin', onFocusIn));

  const refresh = (): void => ScrollTrigger.refresh();
  void document.fonts.ready.then(refresh);
  sync();

  return () => {
    cleanups.forEach((c) => c());
    mm.revert();
    clearTimeout(toastTimer);
    clearTimeout(awayTimer);
    clearInterval(tick);
    typeTween?.kill();
    waves.forEach((w) => w.kill());
    gsap.killTweensOf([toast, warn, waveEl, liveView, ...counters.values(), ...tiles.values()]);
    exitFs();
    delete root.dataset['intro'];
  };
}

export function initInterviewLab(): void {
  onReady(() => {
    const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-il]')).map((r) => mount(r));
    return () => stops.forEach((s) => s());
  });
}
