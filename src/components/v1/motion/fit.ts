import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { $$, EASE, T, countTween, plateDepth, playMockup, playOnEnter, primeMockup, setCount } from './anim';
import { FLOW_MQ, PIN_MQ, pinScene } from './scene';

/**
 * Job Fit. Pinned scene (>=1024x680, motion on): the header stays while the body steps from
 * the score and card to the ranked list, about one viewport of scroll in all.
 * Otherwise stacked, each part revealed on entry. Reduced motion: static.
 */
export function initFit(root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('[data-scene-stage]');
  const frames = $$(root, '[data-fit-frame]');
  const score = root.querySelector<HTMLElement>('[data-fit-score]');
  const big = score?.querySelector<HTMLElement>('[data-anim="count"]');
  const [cardPlate, listPlate] = $$(root, '[data-plate]');
  if (!stage || !score || !big || !cardPlate || !listPlate || frames.length < 2) return () => {};

  const revealScore = (): void => {
    gsap.to(score.children, { autoAlpha: 1, y: 0, duration: T.slower, ease: EASE, stagger: 0.08 });
    countTween(big, 1.4);
  };

  const mm = gsap.matchMedia();
  mm.add({ pin: PIN_MQ, flow: FLOW_MQ }, (ctx) => {
    const { pin } = ctx.conditions as { pin: boolean; flow: boolean };
    setCount(big, 0);
    gsap.set(score.children, { autoAlpha: 0, y: 18 });
    primeMockup(cardPlate);
    primeMockup(listPlate);

    if (!pin) {
      ScrollTrigger.create({ trigger: score, start: 'top 78%', once: true, onEnter: revealScore });
      playOnEnter(cardPlate, cardPlate, 'top 72%');
      playOnEnter(listPlate, listPlate, 'top 82%');
      plateDepth(root);
      return;
    }

    root.setAttribute('data-pinned', '');
    let active = -1;
    const show = (i: number): void => {
      if (i === active) return;
      const prev = frames[active];
      active = i;
      const next = frames[i];
      if (prev) gsap.to(prev, { autoAlpha: 0, y: -14, duration: T.base, ease: 'power2.in', overwrite: true });
      if (next) {
        gsap.fromTo(next, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: T.slower, ease: EASE, overwrite: true });
        if (i === 1) playMockup(listPlate, 0.1);
      }
    };
    gsap.set(frames[1] as HTMLElement, { autoAlpha: 0 });
    active = 0;
    ScrollTrigger.create({
      trigger: stage,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        revealScore();
        playMockup(cardPlate, 0.15);
      },
    });
    const scene = pinScene(stage, 2, 0.5, (p) => show(Math.min(1, Math.floor(p))));
    return () => {
      scene.destroy();
      root.removeAttribute('data-pinned');
      gsap.set(frames, { clearProps: 'all' });
    };
  }, root);

  return () => mm.revert();
}
