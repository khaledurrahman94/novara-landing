/**
 * InterviewLab behaviour.
 *
 * Scrubbed intro (pinned from 1024x680, else a short scrub): the page opens zoomed into the interviewer tile, captions type as you
 * scroll, and the full UI zooms out. Once it is out, the demo is live.
 *
 * Two surfaces. The candidate's screen runs a spoken, transcribed interview: each question is typed as a caption,
 * the self-view shows "Speaking", the answer streams in word by word, then the interview moves on. The team view is
 * the integrity monitor; each event travels there as a pulse before its counter flips.
 *
 * Detections are real browser events and run only while the demo is live and on screen:
 *  - tab switch (visibilitychange), focus lost (window blur/focus), copy of the question and paste (copy / paste),
 *    looking away (pointer outside the window for 2s, fine pointers only).
 *  - simulated switches: camera off, second face, left full screen (no camera access).
 * No network, no storage. Every listener, tween and timer is cleaned up.
 */
import { gsap, ScrollTrigger, onReady, prefersReducedMotion, getLenis } from '../../../../scripts/motion';
import { kinds, lab, clock, span, type Kind } from './copy';

gsap.registerPlugin(ScrollTrigger);

interface Ev {
  kind: Kind;
  /** Overrides the kind's title (paste vs copy). */
  title?: string;
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
const titleOf = (e: Ev): string => `${e.title ?? meta(e.kind)?.title ?? e.kind}${e.detail ? `, ${e.detail}` : ''}`;
type SimKey = 'camera' | 'faces' | 'fullscreen';
const WORD_S = 0.17;

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
  const bars = qa('[data-anim="wave-bar"]', frame);
  const timerHost = frame.querySelector('.tabular-nums');
  const timerNode = timerHost?.lastChild ?? null;
  const toast = q('[data-il-toast]');
  const toastText = q('[data-il-toast-text]');
  const selfOv = q('[data-il-self]');
  const selfCam = q('[data-il-self-cam]');
  const selfFaces = q('[data-il-self-faces]');
  const step = q('[data-il-step]');
  const dots = qa('[data-il-dot]');
  const selfChip = q('[data-il-selfchip]');
  const selfChipText = q('[data-il-selfchip-text]');
  const selfBars = qa('[data-il-selfbar]');
  const tbox = q('[data-il-tbox]');
  const tlabel = q('[data-il-tlabel]');
  const transcript = q('[data-il-transcript]');
  const tghost = q('[data-il-tghost]');
  const link = q('[data-il-link]');
  const pulse = q('[data-il-pulse]');
  const nextBtn = q<HTMLButtonElement>('[data-il-next]');
  const finishBtn = q<HTMLButtonElement>('[data-il-finish]');
  const chip = q('[data-il-chip]');
  const chipText = q('[data-il-chip-text]');
  const tlBox = q('[data-il-tl]');
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
  const wide = window.matchMedia('(min-width: 1024px)');
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
  const sim: Record<SimKey, boolean> = { camera: false, faces: false, fullscreen: false };
  let candSpeaking = false;
  let userPaused = false;
  let seq: gsap.core.Timeline | null = null;
  let inflight: { tl: gsap.core.Timeline; arrive: () => void } | null = null;
  // detection trackers
  let hidden: Mark | null = null;
  let blurred: Mark | null = null;
  let blurIsTab = false;
  let awayMark: Mark | null = null;
  let awayTimer: ReturnType<typeof setTimeout> | undefined;
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

  /* ---------- the candidate's own waveform (self-view) ---------- */
  const selfWaves = rm
    ? []
    : selfBars.map((b) =>
        gsap.to(b, {
          scaleY: () => (candSpeaking ? gsap.utils.random(0.3, 1) : gsap.utils.random(0.08, 0.2)),
          duration: () => gsap.utils.random(0.2, 0.42),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          paused: true,
        }),
      );
  const setSelfStatic = (): void => {
    if (rm) selfBars.forEach((b, i) => gsap.set(b, { scaleY: candSpeaking ? 0.35 + ((i * 37) % 60) / 100 : 0.12 }));
    else selfBars.forEach((b) => gsap.set(b, { scaleY: 0.12 }));
  };
  setSelfStatic();

  /* ---------- the candidate's answer: asking, speaking (transcribing), received ---------- */
  const setCand = (st: 'asking' | 'speaking' | 'received'): void => {
    candSpeaking = st === 'speaking';
    tbox.dataset['state'] = st;
    tlabel.textContent = st === 'asking' ? lab.candidate.waiting : st === 'speaking' ? lab.candidate.transcribing : lab.candidate.received;
    selfChip.dataset['state'] = candSpeaking ? 'speaking' : 'listening';
    selfChipText.textContent = candSpeaking ? lab.candidate.speaking : lab.candidate.listening;
    if (rm) setSelfStatic();
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

  const rowEl = (time: string, label: string, flagged: boolean, tag: string, last: boolean, why?: string): HTMLLIElement => {
    const li = document.createElement('li');
    li.className = 'relative flex gap-2.5 pb-3 last:pb-0';
    if (!last) {
      const line = document.createElement('span');
      line.className = 'absolute left-[0.3125rem] top-4 h-full w-px bg-border-secondary';
      line.setAttribute('aria-hidden', 'true');
      li.append(line);
    }
    const dot = document.createElement('span');
    dot.dataset['dot'] = '';
    dot.className = `relative mt-1 size-[0.6875rem] shrink-0 rounded-full border-2 bg-bg-secondary ${flagged ? 'border-warning' : 'border-border-primary'}`;
    dot.setAttribute('aria-hidden', 'true');
    const body = document.createElement('span');
    body.className = 'min-w-0 flex-1 text-[0.8125rem]';
    const t = document.createElement('span');
    t.className = 'mr-2 tabular-nums text-text-tertiary';
    t.textContent = time;
    const l = document.createElement('span');
    l.className = flagged ? 'font-semibold text-text-primary' : 'text-text-secondary';
    l.textContent = label;
    body.append(t, l);
    if (tag) {
      const s = document.createElement('span');
      s.className = 'ml-2 rounded-full bg-gray-100 px-1.5 py-0.5 text-[0.6875rem] font-medium text-text-secondary';
      s.textContent = tag;
      body.append(s);
    }
    if (flagged) {
      const f = document.createElement('span');
      f.className = 'mt-0.5 block text-xs text-text-tertiary';
      f.textContent = why ?? lab.flagged;
      body.append(f);
    }
    li.append(dot, body);
    return li;
  };

  const sorted = (): Ev[] => [...events].sort((a, b) => a.at - b.at);
  const whyOf = (e: Ev): string => (e.title === lab.pasted ? lab.pastedWhy : (meta(e.kind)?.why ?? ''));

  /** One live timeline row: time, title (and tag), one line of explanation. */
  const liveRow = (at: number, time: string, label: string, flagged: boolean, tag: string, why: string): HTMLLIElement => {
    const li = document.createElement('li');
    li.className = 'il-ev';
    li.dataset['at'] = String(at);
    if (flagged) li.dataset['flagged'] = 'true';
    const dot = document.createElement('span');
    dot.className = 'il-ev-dot';
    dot.setAttribute('aria-hidden', 'true');
    const body = document.createElement('span');
    body.className = 'min-w-0 flex-1';
    const head = document.createElement('span');
    head.className = 'block truncate';
    const t = document.createElement('span');
    t.className = 'mr-2 tabular-nums text-text-tertiary';
    t.textContent = time;
    const l = document.createElement('span');
    l.className = flagged ? 'font-semibold text-text-primary' : 'text-text-secondary';
    l.textContent = label;
    head.append(t, l);
    if (tag) {
      const g = document.createElement('span');
      g.className = 'ml-2 rounded-full bg-gray-100 px-1.5 py-0.5 text-[0.625rem] font-medium text-text-secondary';
      g.textContent = tag;
      head.append(g);
    }
    body.append(head);
    if (why) {
      const w = document.createElement('span');
      w.className = 'block truncate text-[0.6875rem] text-text-tertiary';
      w.textContent = why;
      body.append(w);
    }
    li.append(dot, body);
    return li;
  };
  const startRow = (): HTMLLIElement => liveRow(-1, clock(0), lab.started, false, '', '');
  const evRow = (e: Ev): HTMLLIElement => liveRow(e.at, clock(e.at), titleOf(e), true, tagOf(e), whyOf(e));

  /** Runs a timeline change without the polite live region reading it (rebuilds). */
  let quietTimer: ReturnType<typeof setTimeout> | undefined;
  const quiet = (fn: () => void): void => {
    timeline.setAttribute('aria-live', 'off');
    fn();
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => timeline.setAttribute('aria-live', 'polite'), 300);
  };

  /** Full rebuild, newest on top, "Interview started" last. */
  const renderTimeline = (): void => {
    quiet(() => {
      timeline.replaceChildren(...sorted().reverse().map(evRow), startRow());
      empty.hidden = events.length > 0;
      tlBox.scrollTop = 0;
    });
  };

  /** One new event: slides in at its place (newest on top) without rebuilding the list. */
  const addEventRow = (ev: Ev): void => {
    const row = evRow(ev);
    const place = (): void => {
      const before = Array.from(timeline.children).find((c) => Number((c as HTMLElement).dataset['at'] ?? -1) < ev.at);
      timeline.insertBefore(row, before ?? null);
      empty.hidden = true;
      tlBox.scrollTop = 0;
    };
    place();
    if (!rm) gsap.from(row, { y: -14, opacity: 0, duration: 0.5, ease: EASE });
  };

  const renderChip = (pulseIt = false): void => {
    chipText.textContent = lab.review(total());
    chip.dataset['n'] = total() > 0 ? 'hit' : '0';
    if (pulseIt && !rm) gsap.fromTo(chip, { scale: 1.1 }, { scale: 1, duration: 0.55, ease: EASE });
  };

  const renderSim = (): void => {
    const camOn = sim.camera;
    const facesOn = sim.faces;
    selfCam.hidden = !camOn;
    selfFaces.hidden = camOn || !facesOn;
    selfOv.dataset['on'] = camOn || facesOn ? 'true' : 'false';
    sims.forEach((s) => s.setAttribute('aria-checked', String(sim[s.dataset['ilSim'] as SimKey] === true)));
  };

  const resetPanel = (): void => {
    counts = new Map();
    events = [];
    sim.camera = false;
    sim.faces = false;
    sim.fullscreen = false;
    inflight?.tl.kill();
    inflight = null;
    gsap.killTweensOf(pulse);
    gsap.set(pulse, { opacity: 0 });
    kinds.forEach((k) => {
      const c = counters.get(k.key);
      const t = tiles.get(k.key);
      if (c) {
        gsap.killTweensOf(c);
        gsap.set(c, { clearProps: 'transform,opacity' });
        c.textContent = '0';
      }
      if (t) {
        t.dataset['hit'] = 'false';
        const f = t.querySelector<HTMLElement>('[data-il-flash]');
        if (f) gsap.set(f, { opacity: 0 });
      }
    });
    renderChip();
    renderTimeline();
    renderSim();
    clearTimeout(toastTimer);
    gsap.killTweensOf(toast);
    gsap.set(toast, { opacity: 0 });
  };

  /* ---------- the link: a pulse travels from the candidate's screen to the team view ---------- */
  const sendPulse = (arrive: () => void): void => {
    if (inflight) {
      // A second event while one is travelling: land the first at once.
      const prev = inflight;
      inflight = null;
      prev.tl.kill();
      prev.arrive();
    }
    if (rm) return arrive();
    const horizontal = wide.matches;
    const dist = horizontal ? link.offsetWidth : link.offsetHeight;
    const axis = horizontal ? 'x' : 'y';
    gsap.killTweensOf(pulse);
    gsap.set(pulse, { x: 0, y: 0, scale: 0.6, opacity: 0 });
    const tl = gsap.timeline({
      onComplete: () => {
        inflight = null;
        arrive();
      },
    });
    tl.to(pulse, { opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out' })
      .to(pulse, { [axis]: dist, duration: 0.6, ease: 'power2.inOut' }, 0)
      .to(pulse, { scale: 1.8, opacity: 0, duration: 0.3, ease: 'power2.out' }, '>-0.05');
    inflight = { tl, arrive };
  };

  /* ---------- the one event pipeline ---------- */
  const emit = (kind: Kind, detail = '', simulated = false, at?: number, opts: { title?: string } = {}): void => {
    if (!isLive()) return;
    const ev: Ev = { kind, at: at ?? now(), detail, simulated };
    if (opts.title) ev.title = opts.title;
    events.push(ev);
    const n = (counts.get(kind) ?? 0) + 1;
    counts.set(kind, n);
    const text = titleOf(ev);

    // The event happens on the candidate's side; the team view shows it once the pulse lands.
    sendPulse(() => {
      if (phase !== 'running' || !events.includes(ev)) return;
      const c = counters.get(kind);
      const tile = tiles.get(kind);
      if (c) flip(c, counts.get(kind) ?? n);
      if (tile) {
        tile.dataset['hit'] = 'true';
        const f = tile.querySelector<HTMLElement>('[data-il-flash]');
        if (!rm) {
          gsap.fromTo(tile, { scale: 1.08 }, { scale: 1, duration: 0.6, ease: EASE });
          if (f) gsap.fromTo(f, { opacity: 1 }, { opacity: 0, duration: 0.9, ease: 'power2.out' });
        }
      }
      renderChip(true);
      addEventRow(ev);

      toastText.textContent = `${lab.toast}: ${text}`;
      clearTimeout(toastTimer);
      gsap.killTweensOf(toast);
      if (rm) gsap.set(toast, { opacity: 1, y: 0 });
      else gsap.fromTo(toast, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' });
      toastTimer = setTimeout(() => gsap.to(toast, { opacity: 0, y: -6, duration: rm ? 0 : 0.3, ease: 'power2.in' }), 3200);
    });
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
      selfWaves.forEach((w) => w.play());
    } else if (!live && clockStart !== null) {
      clockBase += performance.now() - clockStart;
      clockStart = null;
      clearInterval(tick);
      waves.forEach((w) => w.pause());
      selfWaves.forEach((w) => w.pause());
      setTimer();
      resetTrackers();
    }
    seq?.paused(!live || userPaused);
  };

  /* ---------- the interview ---------- */
  const showQuestion = (i: number): void => {
    qi = i;
    step.textContent = lab.step(i + 1, TOTAL);
    dots.forEach((d, n) => (d.dataset['on'] = String(n <= i)));
    const nextHadFocus = document.activeElement === nextBtn;
    nextBtn.hidden = i === TOTAL - 1;
    if (nextHadFocus && nextBtn.hidden) finishBtn.focus({ preventScroll: true });
    const text = lab.questions[i] ?? '';
    const ans = lab.answers[i] ?? '';
    const words = ans.split(' ');
    transcript.textContent = '';
    tghost.textContent = ans;
    setCand('asking');

    seq?.kill();
    typeTween = null;
    speaking = false;
    const tl = gsap.timeline({ paused: true });
    seq = tl;
    const capDur = rm ? 0 : Math.min(2.8, Math.max(0.9, text.length * 0.03));
    if (rm) {
      caption.textContent = text;
    } else {
      const o = { n: 0 };
      tl.to(
        o,
        {
          n: text.length,
          duration: capDur,
          ease: 'none',
          onStart: () => void (speaking = true),
          onUpdate: () => void (caption.textContent = text.slice(0, Math.round(o.n))),
          onComplete: () => {
            speaking = false;
            typeTween = null;
          },
        },
        0,
      );
      typeTween = tl.getTweensOf(o)[0] ?? null;
    }
    // The candidate answers aloud; the transcript follows word by word.
    const startAt = capDur + (rm ? 1 : 0.6);
    const talk = rm ? 0 : words.length * WORD_S;
    tl.call(() => setCand('speaking'), undefined, startAt);
    if (rm) {
      tl.call(
        () => {
          transcript.textContent = ans;
        },
        undefined,
        startAt,
      );
    } else {
      const w = { n: 0 };
      tl.to(
        w,
        {
          n: words.length,
          duration: talk,
          ease: 'none',
          onUpdate: () => void (transcript.textContent = words.slice(0, Math.round(w.n)).join(' ')),
        },
        startAt,
      );
    }
    const doneAt = startAt + talk + (rm ? 1 : 0.25);
    tl.call(
      () => {
        transcript.textContent = ans;
        setCand('received');
      },
      undefined,
      doneAt,
    );
    const last = i === TOTAL - 1;
    // Reduced motion: no auto-advance, the visitor uses Next question.
    if (!rm) tl.call(() => (last ? finish() : showQuestion(i + 1)), undefined, doneAt + 1.8);
    tl.paused(!isLive() || userPaused);
  };

  function begin(): void {
    phase = 'running';
    clockBase = 0;
    clockStart = null;
    resetPanel();
    setTimer();
    showQuestion(0);
  }

  const finish = (byUser = false): void => {
    if (phase !== 'running') return;
    // Close out anything still open, then stop the clock.
    const end = now();
    seq?.kill();
    seq = null;
    typeTween?.kill();
    typeTween = null;
    speaking = false;
    candSpeaking = false;
    inflight?.tl.kill();
    inflight = null;
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
      { time: clock(0), label: lab.started, flagged: false, tag: '', why: '' },
      ...list.map((e) => ({ time: clock(e.at), label: titleOf(e), flagged: true, tag: tagOf(e), why: whyOf(e) })),
      { time: clock(end), label: lab.ended, flagged: false, tag: '', why: '' },
    ];
    rows.forEach((r, i) => rTimeline.append(rowEl(r.time, r.label, r.flagged, r.tag, i === rows.length - 1, r.why)));

    reportView.style.minHeight = `${liveView.offsetHeight}px`;
    liveView.hidden = true;
    reportView.hidden = false;
    renderSim();
    status.textContent = `${lab.report.title}. ${n > 0 ? lab.report.summary(n) : lab.report.clean}`;
    if (byUser) rTitle.focus({ preventScroll: true });

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
  on(finishBtn, 'click', () => finish(true));
  const pauseBtn = q<HTMLButtonElement>('[data-il-pause]');
  if (rm) pauseBtn.hidden = true;
  on(pauseBtn, 'click', () => {
    userPaused = !userPaused;
    pauseBtn.textContent = userPaused ? lab.resume : lab.pause;
    seq?.paused(!isLive() || userPaused);
  });
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
    if (!isLive()) return;
    // Anywhere inside the lab, or nowhere in particular (nothing focused).
    const t = e.target instanceof Node ? e.target : null;
    if (t && !root.contains(t) && t !== document.body && t !== document.documentElement) return;
    const len = e.clipboardData?.getData('text')?.length ?? 0;
    emit('copy', len > 0 ? `${len} characters` : '', false, undefined, { title: lab.pasted });
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
  window.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('pointerleave', onLeave);
  win.addEventListener('pointerenter', onEnter);
  document.addEventListener('paste', onPaste);
  cleanups.push(() => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('copy', onCopy);
    window.removeEventListener('scroll', onScroll);
    win.removeEventListener('pointerleave', onLeave);
    win.removeEventListener('pointerenter', onEnter);
    document.removeEventListener('paste', onPaste);
  });

  // Simulated checks: switches only. The camera is never accessed.
  const toggleSim = (key: SimKey): void => {
    if (!isLive()) return;
    const next = !sim[key];
    sim[key] = next;
    renderSim();
    if (next) emit(key, '', true);
  };
  sims.forEach((s) => on(s, 'click', () => toggleSim(s.dataset['ilSim'] as SimKey)));

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
      let x = 0;
      let y = 0;
      for (let n: HTMLElement | null = frameWrap; n && n !== zoom; n = n.offsetParent as HTMLElement | null) {
        x += n.offsetLeft;
        y += n.offsetTop;
      }
      return { fw, fh, cx: x + fw / 2, cy: y + fh / 2 };
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
              start: () => {
                const nav = document.querySelector<HTMLElement>('[data-nav]')?.offsetHeight ?? 64;
                const room = window.innerHeight - nav;
                // Centre the scene in the space under the nav; if it is taller, start just under the nav.
                return pin.offsetHeight <= room - 16 ? `center ${Math.round(nav + room / 2)}px` : `top ${nav + 8}px`;
              },
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
    // Pin only where both surfaces sit side by side and the scene fits under the nav (the frame height is capped in CSS).
    mm.add('(min-width: 1024px) and (min-height: 680px)', () => build(true));
    mm.add('not all and (min-width: 1024px) and (min-height: 680px)', () => build(false));
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
    clearTimeout(quietTimer);
    clearTimeout(awayTimer);
    clearInterval(tick);
    seq?.kill();
    inflight?.tl.kill();
    typeTween?.kill();
    waves.forEach((w) => w.kill());
    selfWaves.forEach((w) => w.kill());
    gsap.killTweensOf([toast, pulse, selfBars, liveView, ...counters.values(), ...tiles.values()]);
    delete root.dataset['intro'];
  };
}

export function initInterviewLab(): void {
  onReady(() => {
    const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-il]')).map((r) => mount(r));
    return () => stops.forEach((s) => s());
  });
}
