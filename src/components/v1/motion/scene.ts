import { ScrollTrigger, getLenis } from '../../../scripts/motion';

/** Pin only on roomy desktop viewports with motion allowed. Everything else stacks normally. */
export const PIN_MQ = '(min-width: 1024px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)';
export const FLOW_MQ =
  '(width < 1024px) and (prefers-reduced-motion: no-preference), (height < 680px) and (prefers-reduced-motion: no-preference)';

const navH = (): number => document.querySelector<HTMLElement>('[data-header]')?.offsetHeight ?? 64;

export interface PinnedScene {
  st: ScrollTrigger;
  goTo: (i: number) => void;
  destroy: () => void;
}

/**
 * Pins `stage` under the sticky header for `perStep` viewports per step and reports fractional
 * progress in steps (0..total). After scrolling settles it eases to the centre of the nearest
 * step (gentle snap), except in the outer half of the first and last step so entering and leaving stay free.
 */
export function pinScene(stage: HTMLElement, total: number, perStep: number, onStep: (p: number) => void): PinnedScene {
  let timer = 0;
  const center = (st: ScrollTrigger, i: number): number => st.start + ((i + 0.5) / total) * (st.end - st.start);
  const scrollTo = (y: number): void => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 0.6 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };
  const st = ScrollTrigger.create({
    trigger: stage,
    start: () => `top ${navH()}px`,
    end: () => `+=${Math.round(window.innerHeight * perStep * total)}`,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      onStep(self.progress * total);
      window.clearTimeout(timer);
      if (self.progress * total < 0.5 || self.progress * total > total - 0.5) return;
      timer = window.setTimeout(() => {
        const p = self.progress * total;
        const i = Math.min(total - 1, Math.floor(p));
        if (Math.abs(p - (i + 0.5)) > 0.12) scrollTo(center(self, i));
      }, 180);
    },
  });
  return {
    st,
    goTo: (i) => {
      window.clearTimeout(timer);
      scrollTo(center(st, i));
    },
    destroy: () => window.clearTimeout(timer),
  };
}
