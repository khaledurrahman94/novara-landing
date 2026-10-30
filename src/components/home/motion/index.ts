/**
 * Home page motion orchestrator. Three kinds of motion: scrubbed (hero, results, how, depth), triggered
 * (reveals, bento entrances) and interactive (drag, bento tiles, the labs). Nothing follows the pointer.
 * Pins only from 768px wide and 620px tall (the Audience pin from 1024x800). Reduced motion keeps every
 * interaction but drops parallax, scrub, pins and loops, and shows end states.
 */
import { gsap, ScrollTrigger, onReady, prefersReducedMotion, getLenis } from '../../../scripts/motion';
import { initScrollDepth } from './depth';
import { initHero } from './hero';
import { initResultsPinned, initResultsSimple } from './results';
import { initHowPinned, initHowSimple, initHowSteps, replayStep } from './how';
import { initTestimonialsFly, initTestimonialsSimple, shuffleTestimonials } from './testimonials';
import { initFit } from './fit';
import { initDecide } from './decide';
import { initAudience } from './audience';
import { initBentoReveal, initPlatform } from './platform';
import { EASE, $, one, safe, scrollToEl } from './util';

/* ---------- chrome: nav state, anchors, demo button (also under reduced motion) ---------- */

function initChrome(): () => void {
  const nav = one(document, '[data-nav]');
  const onScroll = (): void => {
    if (nav) nav.dataset['scrolled'] = window.scrollY > 8 ? 'true' : 'false';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const closeSection = one(document, '#demo-close');
  const closeInput = document.querySelector<HTMLInputElement>('#demo-close-form-email');

  const onClick = (e: Event): void => {
    const a = (e.currentTarget as HTMLAnchorElement).getAttribute('href') ?? '';
    if (e.defaultPrevented || a.length < 2 || !a.startsWith('#')) return;
    const target = a === '#top' ? document.documentElement : one(document, a);
    if (!target) return;
    e.preventDefault();
    const lenis = getLenis();
    if (a === '#top') {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } else scrollToEl(target);
    history.replaceState(null, '', a);
  };
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  anchors.forEach((a) => a.addEventListener('click', onClick));

  const onDemo = (e: Event): void => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!closeSection) return;
    scrollToEl(closeSection);
    window.setTimeout(() => closeInput?.focus({ preventScroll: true }), 700);
  };
  const ctas = $(document, '[data-home-cta]');
  ctas.forEach((c) => c.addEventListener('click', onDemo, true));

  return () => {
    window.removeEventListener('scroll', onScroll);
    anchors.forEach((a) => a.removeEventListener('click', onClick));
    ctas.forEach((c) => c.removeEventListener('click', onDemo, true));
  };
}

/** Section headings and intro blocks rise in once. */
function initReveals(): void {
  $(document, '[data-reveal]').forEach((el) => {
    gsap.set(el, { autoAlpha: 0, y: 20 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => void gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE }),
    });
  });
  // Never leave anything hidden if a trigger misfires.
  window.setTimeout(() => {
    $(document, '[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) gsap.set(el, { autoAlpha: 1, y: 0 });
    });
  }, 4000);
}

export function initHome(): void {
  onReady(() => {
    const reduced = prefersReducedMotion();
    const cleanups: (() => void)[] = [];
    const add = (c: (() => void) | undefined | void): void => void (typeof c === 'function' && cleanups.push(c));

    add(safe('chrome', initChrome));
    const decide = one(document, '[data-decide]');
    if (decide) add(safe('decide', () => initDecide(decide, reduced)));
    const platform = one(document, '[data-platform]');
    if (platform) add(safe('platform', () => initPlatform(platform, reduced)));

    const audienceRoot = one(document, '[data-audience]');
    const audience = audienceRoot ? safe('audience', () => initAudience(audienceRoot, reduced)) : undefined;
    if (audience) add(audience.destroy);
    const howRoot = one(document, '[data-how]');
    if (howRoot) add(safe('how-fit', () => initFit(howRoot)));
    if (howRoot) add(safe('how-steps', () => initHowSteps(howRoot, reduced ? undefined : (i) => { if (!howRoot.classList.contains('is-h')) replayStep(i); })));

    if (reduced) return () => cleanups.forEach((c) => c());

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // Per-load shuffle of the testimonial cards (before reveals and the fly bind to them).
      const testiRoot = one(document, '[data-testi-scroll]')?.closest<HTMLElement>('section') ?? null;
      if (testiRoot) safe('testimonials-order', () => shuffleTestimonials(testiRoot));
      const hero = one(document, '[data-hero]');
      if (hero) safe('hero', () => initHero(hero));
      safe('reveals', initReveals);
      const bento = one(document, '[data-bento]');
      if (bento) safe('bento', () => initBentoReveal(bento));

      const results = one(document, '[data-results]');
      const how = one(document, '[data-how]');
      const testi = one(document, '[data-testi-scroll]')?.closest<HTMLElement>('section') ?? null;
      mm.add('(min-width: 768px)', () => {
        safe('depth', initScrollDepth);
      });
      mm.add('(min-width: 768px) and (min-height: 620px)', () => {
        const c1 = results ? safe('results', () => initResultsPinned(results)) : undefined;
        // After Results: its Offered avatars fly into their testimonial cards once the pin releases.
        const c3 = testi ? safe('testimonials', () => initTestimonialsFly(testi)) : undefined;
        const c2 = how ? safe('how', () => initHowPinned(how)) : undefined;
        return () => {
          if (typeof c3 === 'function') c3();
          if (typeof c1 === 'function') c1();
          if (typeof c2 === 'function') c2();
        };
      });
      // The Audience pin fits one viewport and scales its stage down on shorter screens; below 600px tall it keeps the plain tabs.
      mm.add('(min-width: 1024px) and (min-height: 600px)', () => {
        const c = audience ? safe('audience-pin', () => audience.pin()) : undefined;
        return () => {
          if (typeof c === 'function') c();
        };
      });
      mm.add('(max-width: 767.98px), (max-height: 619.98px)', () => {
        if (results) safe('results-simple', () => initResultsSimple(results));
        if (testi) safe('testimonials-simple', () => initTestimonialsSimple(testi));
        const c = how ? safe('how-simple', () => initHowSimple(how)) : undefined;
        return () => {
          if (typeof c === 'function') c();
        };
      });
    });

    // Pins come from this page and both labs in no fixed order, and breakpoint
    // changes re-create them, so refresh every trigger top to bottom each time.
    const sortTriggers = (): void => {
      ScrollTrigger.sort();
    };
    ScrollTrigger.addEventListener('refreshInit', sortTriggers);
    const refresh = (): void => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    void document.fonts.ready.then(refresh);
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', sortTriggers);
      cleanups.forEach((c) => c());
      mm.revert();
      ctx.revert();
    };
  });
}
