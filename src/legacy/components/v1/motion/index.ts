import { onReady, ScrollTrigger } from '../../../scripts/motion';
import { initHero } from './hero';
import { initFit } from './fit';
import { initHow } from './how';
import { initPlatform } from './platform';
import { initCta, initFooter, initHeader, initInterview } from './sections';

/** One orchestrator, sections in DOM order so pin spacing resolves top to bottom. */
export function initV1(): void {
  onReady(() => {
    const cleanups: (() => void)[] = [];
    const run = <T extends HTMLElement>(sel: string, fn: (el: T) => () => void): void => {
      const el = document.querySelector<T>(sel);
      if (el) cleanups.push(fn(el));
    };
    run('[data-header]', initHeader);
    run('[data-hero]', initHero);
    run('[data-how]', initHow);
    run('[data-fit]', initFit);
    run('[data-interview]', initInterview);
    run('[data-platform]', initPlatform);
    run('[data-cta]', initCta);
    run('[data-footer]', initFooter);

    const refresh = (): void => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    void document.fonts.ready.then(refresh);
    return () => cleanups.forEach((c) => c());
  });
}
