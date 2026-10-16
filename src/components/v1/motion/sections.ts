import { gsap, ScrollTrigger, getLenis, prefersReducedMotion } from '../../../scripts/motion';
import { $$, EASE, T, countTween, plateDepth, playOnEnter, primeMockup, setCount, waveWhileVisible } from './anim';

const noop = (): void => {};

/** Job Fit: score counts up, criteria stagger in, reasoning fades in line by line. */
export function initFit(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return noop;
  const ctx = gsap.context(() => {
    const score = root.querySelector<HTMLElement>('[data-fit-score]');
    const big = score?.querySelector<HTMLElement>('[data-anim="count"]');
    const plates = $$(root, '[data-plate]');
    const [cardPlate, listPlate] = plates;

    if (big && score) {
      setCount(big, 0);
      gsap.set(score.children, { autoAlpha: 0, y: 18 });
      ScrollTrigger.create({
        trigger: score,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(score.children, { autoAlpha: 1, y: 0, duration: T.slower, ease: EASE, stagger: 0.08 });
          countTween(big, 1.4);
        },
      });
    }
    if (cardPlate) {
      primeMockup(cardPlate);
      playOnEnter(cardPlate, cardPlate, 'top 72%');
    }
    if (listPlate) {
      primeMockup(listPlate);
      playOnEnter(listPlate, listPlate, 'top 82%');
    }
    plateDepth(root);
  }, root);
  return () => ctx.revert();
}

/** Interview: captions type in, timeline events appear in order with scroll, the focus counter flips 0 to 1, waveform runs only on screen. */
export function initInterview(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return noop;
  const ctx = gsap.context(() => {
    const frame = root.querySelector<HTMLElement>('[data-int-frame]');
    const integrity = root.querySelector<HTMLElement>('[data-int-integrity]');
    const score = root.querySelector<HTMLElement>('[data-int-score]');

    if (frame) {
      primeMockup(frame);
      playOnEnter(frame, frame, 'top 78%');
      const card = frame.querySelector<HTMLElement>('[data-card="interview-frame"]');
      if (card) waveWhileVisible(card);
    }
    if (score) {
      primeMockup(score);
      playOnEnter(score, score, 'top 88%');
    }
    if (integrity) {
      const events = $$(integrity, '[data-anim="event"]');
      const counters = $$(integrity, '[data-anim="counter"]');
      gsap.set(events, { autoAlpha: 0, y: 12 });
      counters.forEach((c) => setCount(c, 0));
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: integrity, start: 'top 72%', end: 'bottom 50%', scrub: 0.6 },
      });
      events.forEach((ev, i) => {
        const at = i * 1.2;
        tl.to(ev, { autoAlpha: 1, y: 0, duration: 1 }, at);
        if (ev.dataset['flagged'] === 'true') {
          counters.forEach((c) => {
            const target = Number(c.dataset['count']);
            if (!target) return;
            const o = { v: 0 };
            tl.to(o, { v: target, duration: 0.3, onUpdate: () => setCount(c, o.v) }, at + 0.5);
          });
        }
      });
    }
    plateDepth(root);
  }, root);
  return () => ctx.revert();
}

/** Footer wordmark rises into place as the footer arrives. */
export function initFooter(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return noop;
  const mark = root.querySelector<HTMLElement>('[data-wordmark]');
  if (!mark) return noop;
  const ctx = gsap.context(() => {
    gsap.fromTo(
      mark,
      { yPercent: -22 },
      { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom bottom', scrub: true } },
    );
  }, root);
  return () => ctx.revert();
}

/** Sticky header fill once scrolled, plus anchor scrolling through Lenis. Runs under reduced motion too. */
export function initHeader(header: HTMLElement): () => void {
  let raf = 0;
  const update = (): void => {
    raf = 0;
    header.dataset['scrolled'] = window.scrollY > 8 ? 'true' : 'false';
  };
  const onScroll = (): void => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });

  const onClick = (e: MouseEvent): void => {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const hash = a.getAttribute('href') ?? '';
    if (hash.length < 2) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    const lenis = getLenis();
    if (hash === '#top') {
      if (lenis) lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } else if (lenis) {
      lenis.scrollTo(target, { offset: -64, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
    history.replaceState(null, '', hash);
    if (hash === '#demo') window.setTimeout(() => document.getElementById('demo-email')?.focus({ preventScroll: true }), 900);
  };
  document.addEventListener('click', onClick);

  return () => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('click', onClick);
    if (raf) cancelAnimationFrame(raf);
  };
}

/** CTA form: client-side validation and a success state. No backend yet. */
export function initCta(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>('[data-cta-form]');
  const input = form?.querySelector<HTMLInputElement>('input[name="email"]');
  const error = root.querySelector<HTMLElement>('[data-form-error]');
  const errorText = root.querySelector<HTMLElement>('[data-form-error-text]');
  const success = root.querySelector<HTMLElement>('[data-form-success]');
  if (!form || !input || !error || !errorText || !success) return noop;
  form.noValidate = true;

  const fail = (msg: string): void => {
    errorText.textContent = msg;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  };
  const clear = (): void => {
    error.hidden = true;
    input.removeAttribute('aria-invalid');
  };
  const onSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return fail(form.dataset['msgEmpty'] ?? '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return fail(form.dataset['msgInvalid'] ?? '');
    clear();
    // TODO: POST to `form.action` once a demo-request endpoint exists. Today this only shows the success state.
    form.hidden = true;
    success.hidden = false;
    if (!prefersReducedMotion()) gsap.fromTo(success, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: T.slower, ease: EASE });
    success.setAttribute('tabindex', '-1');
    success.focus({ preventScroll: true });
  };
  form.addEventListener('submit', onSubmit);
  input.addEventListener('input', clear);
  return () => {
    form.removeEventListener('submit', onSubmit);
    input.removeEventListener('input', clear);
  };
}
