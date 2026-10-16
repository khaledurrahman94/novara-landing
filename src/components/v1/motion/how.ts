import { gsap, ScrollTrigger, getLenis } from '../../../scripts/motion';
import { $$, EASE, T, fitInto, playMockup, playOnEnter, plateDepth, primeMockup } from './anim';

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/**
 * How it works.
 * >=1024px: the stage is pinned and scroll scrubs through six steps (the list is also clickable).
 * <1024px: stacked steps, each mockup revealed on entry. Reduced motion: stacked static end state.
 */
export function initHow(root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('[data-how-stage]');
  const steps = $$(root, '[data-step]');
  if (!stage || steps.length === 0) return () => {};
  const texts = $$(root, '[data-step-text]');
  const figs = $$(root, '.how-fig');
  const fills = $$(root, '[data-fill]');
  const total = steps.length;

  const mm = gsap.matchMedia();
  mm.add(
    {
      pin: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      flow: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const { pin } = ctx.conditions as { pin: boolean; flow: boolean };

      if (!pin) {
        figs.forEach((f) => {
          primeMockup(f);
          playOnEnter(f, f, 'top 82%');
        });
        steps.forEach((li) => {
          const text = li.querySelector<HTMLElement>('[data-step-text]');
          if (!text) return;
          gsap.fromTo(
            text,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: T.slower, ease: EASE, scrollTrigger: { trigger: li, start: 'top 85%', once: true } },
          );
        });
        plateDepth(root);
        return;
      }

      root.setAttribute('data-pinned', '');
      let active = -1;

      const fitAll = (): void =>
        figs.forEach((f) => {
          const inner = f.querySelector<HTMLElement>('[data-anim="plate-inner"]');
          const content = inner?.firstElementChild as HTMLElement | null | undefined;
          if (content) fitInto(f, content);
        });

      gsap.set(figs, { autoAlpha: 0 });
      figs.forEach((f) => primeMockup(f));

      const setActive = (i: number, first = false): void => {
        if (i === active) return;
        const prev = active;
        active = i;
        texts.forEach((t, k) => {
          if (k === i) {
            t.setAttribute('data-active', '');
            t.setAttribute('aria-current', 'step');
          } else {
            t.removeAttribute('data-active');
            t.removeAttribute('aria-current');
          }
        });
        const prevFig = figs[prev];
        const next = figs[i];
        if (prevFig) gsap.to(prevFig, { autoAlpha: 0, y: -14, duration: T.base, ease: 'power2.in', overwrite: true });
        if (next && !first) {
          gsap.fromTo(next, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: T.slower, ease: EASE, overwrite: true });
          playMockup(next, 0.1);
        }
      };

      // Step 0 shows with the stage and plays when the stage scrolls into view.
      setActive(0, true);
      const first = figs[0];
      if (first) {
        gsap.set(first, { autoAlpha: 1, y: 0 });
        ScrollTrigger.create({ trigger: stage, start: 'top 70%', once: true, onEnter: () => void playMockup(first) });
      }

      const st = ScrollTrigger.create({
        trigger: stage,
        start: 'top 64px',
        end: () => `+=${Math.round(window.innerHeight * 0.55 * total)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress * total;
          setActive(Math.min(total - 1, Math.floor(p)));
          fills.forEach((f, k) => gsap.set(f, { scaleX: clamp01(p - k) }));
        },
      });

      const goTo = (i: number): void => {
        const y = st.start + ((i + 0.5) / total) * (st.end - st.start);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 1.1 });
        else window.scrollTo({ top: y, behavior: 'smooth' });
      };
      const cleanups: (() => void)[] = [];
      texts.forEach((t, i) => {
        t.setAttribute('role', 'button');
        t.setAttribute('tabindex', '0');
        const click = (): void => goTo(i);
        const key = (e: KeyboardEvent): void => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goTo(i);
          }
        };
        t.addEventListener('click', click);
        t.addEventListener('keydown', key);
        cleanups.push(() => {
          t.removeEventListener('click', click);
          t.removeEventListener('keydown', key);
          t.removeAttribute('role');
          t.removeAttribute('tabindex');
          t.removeAttribute('data-active');
          t.removeAttribute('aria-current');
        });
      });

      fitAll();
      ScrollTrigger.addEventListener('refreshInit', fitAll);

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', fitAll);
        cleanups.forEach((c) => c());
        root.removeAttribute('data-pinned');
        gsap.set(figs, { clearProps: 'all' });
        figs.forEach((f) => {
          const inner = f.querySelector<HTMLElement>('[data-anim="plate-inner"]');
          if (inner?.firstElementChild) gsap.set(inner.firstElementChild, { clearProps: 'transform' });
        });
      };
    },
    root,
  );

  return () => mm.revert();
}
