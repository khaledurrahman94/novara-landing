/**
 * Fit-to-frame. A frame holds one product visual in [data-fit-inner]. The visual keeps its natural size
 * (a fixed design width) and is scaled down, never up, so all of it shows inside the frame and nothing is cropped.
 * The frame gets [data-fit-on] once measured; without JS it stays an auto-height box and the visual flows normally.
 */
import { $, one } from './util';

/** Breathing room kept between the scaled visual and the frame edge, in px. */
const PAD = 16;

/** The current fit scale of a frame (1 when not fitted). */
export const fitScale = (frame: HTMLElement): number => {
  const s = Number(frame.dataset['fitScale']);
  return Number.isFinite(s) && s > 0 ? s : 1;
};

/** Fit every `[data-fit]` frame under root. Returns a cleanup. */
export function initFit(root: ParentNode): () => void {
  const frames = $(root, '[data-fit]');
  const cleanups = frames.map((frame) => {
    const inner = one(frame, '[data-fit-inner]');
    if (!inner) return () => undefined;
    const apply = (): void => {
      // The frame takes its fixed height first (the inner leaves the flow), then the visual is measured.
      frame.dataset['fitOn'] = 'true';
      // offsetWidth/Height ignore transforms, so this is the natural size.
      const nw = inner.offsetWidth;
      const nh = inner.offsetHeight;
      if (!nw || !nh) return;
      const s = Math.min(1, (frame.clientWidth - PAD * 2) / nw, (frame.clientHeight - PAD * 2) / nh);
      const k = Math.max(0.2, s);
      frame.dataset['fitScale'] = k.toFixed(4);
      inner.style.transform = `translate(-50%, -50%) scale(${k})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(frame);
    ro.observe(inner);
    void document.fonts.ready.then(apply);
    return () => {
      ro.disconnect();
      delete frame.dataset['fitOn'];
      delete frame.dataset['fitScale'];
      inner.style.transform = '';
    };
  });
  return () => cleanups.forEach((c) => c());
}
