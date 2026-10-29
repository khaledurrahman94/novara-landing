/**
 * InterviewLab animation.
 *
 * Scrubbed intro (pinned from 1024x680, else a short scrub): the page opens zoomed into the interviewer tile, the caption
 * types as you scroll, and the full UI zooms out. Once it is out, the walkthrough plays by itself, once.
 *
 * The walkthrough is a scripted replay on one GSAP timeline (script in copy.ts): the AI interviewer speaks each question
 * (waveform, typed caption), the candidate's answer is transcribed, and the integrity monitor's events tick up on a clock.
 * Each event travels from the candidate's screen to the team view as a pulse before its counter flips. At the end the
 * report appears. Nothing is detected from the visitor: there are no listeners for tabs, focus, clipboard, full screen
 * or pointer. The timeline pauses whenever the lab is off screen. Under reduced motion nothing runs (CSS shows the
 * static sample report). Every tween and timer is cleaned up.
 */
import { gsap, ScrollTrigger, onReady, prefersReducedMotion } from '../../../../scripts/motion';
import { kinds, lab, script, clock, eventTitle, type Kind, type ScriptEvent } from './copy';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'expo.out';
const TOTAL = lab.questions.length;
const WORD_S = 0.17;

function mount(root: HTMLElement): () => void {
  // Reduced motion: the static sample report is shown by CSS, so there is nothing to play.
  if (prefersReducedMotion()) return () => undefined;

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
  const chip = q('[data-il-chip]');
  const chipText = q('[data-il-chip-text]');
  const timeline = q('[data-il-timeline]');
  const empty = q('[data-il-empty]');
  const status = q('[data-il-status]');
  const cue = q('[data-il-cue]');
  const fades = qa('[data-il-fade]');
  const tiles = new Map<Kind, HTMLElement>(kinds.map((k) => [k.key, q(`[data-il-tile="${k.key}"]`)]));
  const counters = new Map<Kind, HTMLElement>(kinds.map((k) => [k.key, q(`[data-il-count="${k.key}"]`)]));

  const wide = window.matchMedia('(min-width: 1024px)');

  /* ---------- state ---------- */
  let phase: 'idle' | 'running' | 'report' = 'idle';
  let introDone = false;
  let inView = false;
  let qi = 0;
  const fired: ScriptEvent[] = [];
  const counts = new Map<Kind, number>();
  let master: gsap.core.Timeline | null = null;
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  let speaking = false;
  let candSpeaking = false;
  let lastSecond = -1;
  let inflight: { tl: gsap.core.Timeline; arrive: () => void } | null = null;

  const isLive = (): boolean => phase === 'running' && introDone && inView;
  const setTimer = (): void => {
    const sec = Math.floor(master?.time() ?? 0);
    if (sec === lastSecond) return;
    lastSecond = sec;
    if (timerNode) timerNode.textContent = clock(sec * 1000);
  };

  /* ---------- waveforms: move only while live ---------- */
  const waves = bars.map((b) =>
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
  const selfWaves = selfBars.map((b) =>
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
  selfBars.forEach((b) => gsap.set(b, { scaleY: 0.12 }));

  /* ---------- the candidate's answer: asking, speaking (transcribing), received ---------- */
  const setCand = (st: 'asking' | 'speaking' | 'received'): void => {
    candSpeaking = st === 'speaking';
    tbox.dataset['state'] = st;
    tlabel.textContent = st === 'asking' ? lab.candidate.waiting : st === 'speaking' ? lab.candidate.transcribing : lab.candidate.received;
    selfChip.dataset['state'] = candSpeaking ? 'speaking' : 'listening';
    selfChipText.textContent = candSpeaking ? lab.candidate.speaking : lab.candidate.listening;
  };

  /* ---------- panel: counters, chip, timeline ---------- */
  const flip = (el: HTMLElement, value: number): void => {
    gsap
      .timeline()
      .to(el, { yPercent: -60, opacity: 0, duration: 0.15, ease: 'power2.in' })
      .add(() => void (el.textContent = String(value)))
      .fromTo(el, { yPercent: 60 }, { yPercent: 0, opacity: 1, duration: 0.25, ease: EASE });
  };

  const rowEl = (time: string, label: string, flagged: boolean, last: boolean): HTMLLIElement => {
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
    if (flagged) {
      const f = document.createElement('span');
      f.className = 'mt-0.5 block text-xs text-text-tertiary';
      f.textContent = lab.flagged;
      body.append(f);
    }
    li.append(dot, body);
    return li;
  };

  const renderTimeline = (animateLast: boolean): void => {
    const shown = fired.slice(-3);
    const hiddenCount = fired.length - shown.length;
    timeline.replaceChildren();
    const items: HTMLLIElement[] = [];
    const rows: { time: string; label: string; flagged: boolean }[] = [{ time: clock(0), label: lab.started, flagged: false }];
    shown.forEach((e) => rows.push({ time: clock(e.at * 1000), label: eventTitle(e), flagged: true }));
    rows.forEach((r, i) => {
      const li = rowEl(r.time, r.label, r.flagged, i === rows.length - 1 && hiddenCount === 0);
      items.push(li);
      timeline.append(li);
      if (i === 0 && hiddenCount > 0) {
        const more = document.createElement('li');
        more.className = 'mb-2 pl-[1.3125rem] text-xs text-text-tertiary';
        more.textContent = lab.earlier(hiddenCount);
        timeline.append(more);
      }
    });
    empty.hidden = fired.length > 0;
    const last = items[items.length - 1];
    if (animateLast && last) {
      gsap.from(last, { y: 10, opacity: 0, duration: 0.6, ease: EASE });
      const dot = last.querySelector<HTMLElement>('[data-dot]');
      if (dot) gsap.from(dot, { scale: 0, duration: 0.5, ease: 'back.out(2.4)' });
    }
  };

  const renderChip = (): void => {
    chipText.textContent = lab.review(fired.length);
    chip.dataset['n'] = fired.length > 0 ? 'hit' : '0';
  };

  /** The self-view tile shows "Camera off" or "2 faces" while the matching event is live. */
  const setOverlay = (kind: 'camera' | 'faces' | null): void => {
    selfCam.hidden = kind !== 'camera';
    selfFaces.hidden = kind !== 'faces';
    selfOv.dataset['on'] = kind ? 'true' : 'false';
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

  /** One scripted event: it happens on the candidate's side; the team view shows it once the pulse lands. */
  const emit = (ev: ScriptEvent): void => {
    sendPulse(() => {
      if (phase !== 'running') return;
      fired.push(ev);
      const n = (counts.get(ev.kind) ?? 0) + 1;
      counts.set(ev.kind, n);
      const c = counters.get(ev.kind);
      const tile = tiles.get(ev.kind);
      if (c) flip(c, n);
      if (tile) {
        tile.dataset['hit'] = 'true';
        gsap.fromTo(tile, { scale: 1.05 }, { scale: 1, duration: 0.55, ease: EASE });
      }
      renderChip();
      renderTimeline(true);

      toastText.textContent = `${lab.toast}: ${eventTitle(ev)}`;
      clearTimeout(toastTimer);
      gsap.killTweensOf(toast);
      gsap.fromTo(toast, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' });
      toastTimer = setTimeout(() => gsap.to(toast, { opacity: 0, y: -6, duration: 0.3, ease: 'power2.in' }), 3200);
    });
  };

  /* ---------- the interview ---------- */
  const showQuestion = (i: number): void => {
    qi = i;
    step.textContent = lab.step(i + 1, TOTAL);
    dots.forEach((d, n) => (d.dataset['on'] = String(n <= i)));
    transcript.textContent = '';
    tghost.textContent = lab.answers[i] ?? '';
    setCand('asking');
  };

  /** The whole walkthrough as one timeline, so pausing it pauses the questions, the events and the clock together. */
  const build = (): gsap.core.Timeline => {
    const tl = gsap.timeline({ paused: true, onUpdate: setTimer });
    lab.questions.forEach((text, i) => {
      const at = i * script.questionSeconds;
      const ans = lab.answers[i] ?? '';
      const words = ans.split(' ');
      const capDur = Math.min(2.8, Math.max(0.9, text.length * 0.03));
      const talk = words.length * WORD_S;
      const startAt = at + capDur + 0.6;
      const o = { n: 0 };
      const w = { n: 0 };
      if (i > 0) tl.call(() => showQuestion(i), undefined, at);
      // The interviewer speaks the question: waveform up, caption typed.
      tl.to(
        o,
        {
          n: text.length,
          duration: capDur,
          ease: 'none',
          onStart: () => void (speaking = true),
          onUpdate: () => void (caption.textContent = text.slice(0, Math.round(o.n))),
          onComplete: () => void (speaking = false),
        },
        at,
      );
      // The candidate answers aloud; the transcript follows word by word.
      tl.call(() => setCand('speaking'), undefined, startAt);
      tl.to(w, { n: words.length, duration: talk, ease: 'none', onUpdate: () => void (transcript.textContent = words.slice(0, Math.round(w.n)).join(' ')) }, startAt);
      tl.call(
        () => {
          transcript.textContent = ans;
          setCand('received');
        },
        undefined,
        startAt + talk + 0.25,
      );
    });
    script.events.forEach((ev) => tl.call(() => emit(ev), undefined, ev.at));
    script.overlays.forEach((o) => {
      tl.call(() => setOverlay(o.kind), undefined, o.from);
      tl.call(() => setOverlay(null), undefined, o.to);
    });
    tl.call(finish, undefined, script.end);
    return tl;
  };

  function begin(): void {
    phase = 'running';
    showQuestion(0);
    master = build();
    setTimer();
    master.play(0);
  }

  function finish(): void {
    if (phase !== 'running') return;
    speaking = false;
    candSpeaking = false;
    inflight?.tl.kill();
    inflight = null;
    phase = 'report';
    sync();

    reportView.style.minHeight = `${liveView.offsetHeight}px`;
    liveView.hidden = true;
    reportView.hidden = false;
    status.textContent = `${lab.report.title}. ${lab.report.summary(script.events.length)}`;

    // The report rows rise, and the sample evaluation counts up.
    const num = q('[data-evidence-score]', reportView);
    const o = { v: 0 };
    gsap.fromTo(reportView.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: EASE });
    gsap.fromTo(qa('[data-il-rrow]', reportView), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.25, ease: EASE });
    gsap.to(o, { v: Number(num.dataset['count'] ?? 0), duration: 1.2, delay: 0.3, ease: 'power3.out', onUpdate: () => void (num.textContent = String(Math.round(o.v))) });
    ScrollTrigger.refresh();
  }

  /** Starts the walkthrough once the intro is out and the lab is on screen, and pauses everything when it is not. */
  function sync(): void {
    if (phase === 'idle' && introDone && inView) begin();
    const live = isLive();
    master?.paused(!live);
    if (live) {
      waves.forEach((w) => w.play());
      selfWaves.forEach((w) => w.play());
    } else {
      waves.forEach((w) => w.pause());
      selfWaves.forEach((w) => w.pause());
    }
  }

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

  /* ---------- scrubbed intro ---------- */
  const setIntro = (done: boolean): void => {
    if (introDone === done) return;
    introDone = done;
    // Back from the intro: the caption shows the question again.
    if (done && phase === 'running') caption.textContent = lab.questions[qi] ?? '';
    sync();
  };

  const mm = gsap.matchMedia();
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
  const buildIntro = (pinned: boolean): (() => void) => {
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
        // Before the interview starts, the intro caption types with the scroll.
        if (phase === 'idle' || p < 0.5) caption.textContent = lab.intro.slice(0, Math.round(typed.n));
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
    tl.fromTo(
      zoom,
      { x: () => m().x, y: () => m().y, scale: () => m().s, transformOrigin: () => m().o },
      { x: 0, y: 0, scale: 1, transformOrigin: () => m().o, ease: 'power2.inOut', duration: 1 },
      0,
    );
    tl.to(typed, { n: lab.intro.length, duration: 0.5, ease: 'none' }, 0.02);
    tl.fromTo(fades, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.08 }, 0.6);
    tl.to(cue, { opacity: 0, duration: 0.2 }, 0);
    return () => {
      setIntro(true);
      gsap.set([zoom, ...fades, cue], { clearProps: 'all' });
    };
  };
  // Pin only where both surfaces sit side by side and the scene fits under the nav (the frame height is capped in CSS).
  mm.add('(min-width: 1024px) and (min-height: 680px)', () => buildIntro(true));
  mm.add('not all and (min-width: 1024px) and (min-height: 680px)', () => buildIntro(false));

  const refresh = (): void => ScrollTrigger.refresh();
  void document.fonts.ready.then(refresh);
  sync();

  return () => {
    io.disconnect();
    mm.revert();
    clearTimeout(toastTimer);
    master?.kill();
    inflight?.tl.kill();
    waves.forEach((w) => w.kill());
    selfWaves.forEach((w) => w.kill());
    gsap.killTweensOf([toast, pulse, selfBars, liveView, ...counters.values(), ...tiles.values()]);
  };
}

export function initInterviewLab(): void {
  onReady(() => {
    const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-il]')).map((r) => mount(r));
    return () => stops.forEach((s) => s());
  });
}
