/**
 * Platform bento: every tile is something you can use. Click a slot, copy the embed code, flip a
 * permission, type a candidate name, switch the analytics view. All of it works with instant
 * state changes under reduced motion.
 */
import { gsap, ScrollTrigger } from '../../../scripts/motion';
import { v3 } from '../../../content/v3';
import { $, EASE, num, one } from './util';

const p = v3.platform;

function pipeline(root: HTMLElement): void {
  // Cards lift on hover (CSS). Make them reachable by keyboard so focus lifts them too.
  $(root, '[data-card="pipeline"] [data-anim]').forEach((el) => el.setAttribute('tabindex', '0'));
}

function scheduling(root: HTMLElement, reduced: boolean): () => void {
  const sched = one(root, '[data-sched]');
  const grid = one(root, '[data-slot-grid]');
  const pick = one(root, '[data-pick]');
  const booked = one(root, '[data-booked]');
  const previous = one(root, '[data-previous]');
  const toast = one(root, '[data-toast]');
  if (!sched || !grid || !pick || !booked || !previous || !toast) return () => undefined;
  const day = sched.dataset['day'] ?? '';
  const buttons = $(grid, '[role="radio"]');
  let current = buttons.find((b) => b.getAttribute('aria-checked') === 'true');
  let timer: ReturnType<typeof setTimeout> | undefined;

  const place = (btn: HTMLElement, animate: boolean): void => {
    const x = btn.offsetLeft - pick.offsetLeft;
    const y = btn.offsetTop - pick.offsetTop;
    if (animate && !reduced) gsap.to(pick, { x, y, duration: 0.6, ease: 'back.out(1.5)', overwrite: true });
    else gsap.set(pick, { x, y });
  };
  const flash = (text: string): void => {
    toast.textContent = text;
    clearTimeout(timer);
    if (reduced) gsap.set(toast, { opacity: 1, y: 0 });
    else gsap.fromTo(toast, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: EASE, overwrite: true });
    timer = setTimeout(() => gsap.to(toast, { opacity: 0, y: reduced ? 0 : 6, duration: reduced ? 0 : 0.3, overwrite: true }), 2600);
  };
  const handlers = buttons.map((btn) => {
    const onClick = (): void => {
      if (btn === current) return;
      current = btn;
      buttons.forEach((b) => b.setAttribute('aria-checked', b === btn ? 'true' : 'false'));
      previous.textContent = booked.textContent;
      booked.textContent = `${day}, ${btn.dataset['time'] ?? ''}`;
      place(btn, true);
      flash(`Interview booked for ${day}, ${btn.dataset['time'] ?? ''}`);
    };
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  });
  const onResize = (): void => {
    if (current) place(current, false);
  };
  window.addEventListener('resize', onResize);
  if (current) place(current, false);
  return () => {
    clearTimeout(timer);
    window.removeEventListener('resize', onResize);
    handlers.forEach((h) => h());
  };
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

function career(root: HTMLElement, reduced: boolean): () => void {
  const btn = one(root, '[data-copy]');
  const label = one(root, '[data-copy-label]');
  const status = one(root, '[data-copy-status]');
  if (!btn || !label || !status) return () => undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const onClick = async (): Promise<void> => {
    let lines: string[] = [];
    try {
      lines = JSON.parse(btn.dataset['embed'] ?? '[]') as string[];
    } catch {
      lines = [];
    }
    const ok = await copyText(lines.join('\n'));
    clearTimeout(timer);
    label.textContent = ok ? p.copied : p.copyEmbed;
    status.textContent = ok ? p.copied : p.copyFail;
    if (!reduced) gsap.fromTo(label, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: EASE, overwrite: true });
    if (ok) timer = setTimeout(() => void (label.textContent = p.copyEmbed), 2000);
  };
  btn.addEventListener('click', onClick);
  return () => {
    clearTimeout(timer);
    btn.removeEventListener('click', onClick);
  };
}

function roles(root: HTMLElement): () => void {
  const switches = $(root, '[data-tile="roles"] [role="switch"]');
  const handlers = switches.map((sw) => {
    const onClick = (): void => sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    sw.addEventListener('click', onClick);
    return () => sw.removeEventListener('click', onClick);
  });
  return () => handlers.forEach((h) => h());
}

function email(root: HTMLElement): () => void {
  const input = one(root, '[data-name-input]') as HTMLInputElement | null;
  const chip = one(root, '[data-name-chip]');
  const restore = one(root, '[data-restore]');
  const save = one(root, '[data-save]');
  const saveLabel = one(root, '[data-save-label]');
  const status = one(root, '[data-email-status]');
  if (!input || !chip || !restore || !save || !saveLabel || !status) return () => undefined;
  const fallback = chip.dataset['default'] ?? '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const sync = (): void => void (chip.textContent = input.value.trim() || fallback);
  const onRestore = (): void => {
    input.value = '';
    sync();
    status.textContent = 'Default template restored.';
  };
  const onSave = (): void => {
    saveLabel.textContent = p.saved;
    status.textContent = p.saved;
    clearTimeout(timer);
    timer = setTimeout(() => void (saveLabel.textContent = p.save), 1600);
  };
  input.addEventListener('input', sync);
  restore.addEventListener('click', onRestore);
  save.addEventListener('click', onSave);
  return () => {
    clearTimeout(timer);
    input.removeEventListener('input', sync);
    restore.removeEventListener('click', onRestore);
    save.removeEventListener('click', onSave);
  };
}

interface Trend {
  tabs: string[];
  data: Record<string, number[]>;
  weeks: string[];
}

function analytics(root: HTMLElement, reduced: boolean): () => void {
  const box = one(root, '[data-analytics]');
  if (!box) return () => undefined;
  let trend: Trend;
  try {
    trend = JSON.parse(box.dataset['trend'] ?? '') as Trend;
  } catch {
    return () => undefined;
  }
  const tabs = $(box, '[role="tab"]');
  const values = $(box, '[data-value]');
  const bars = $(box, '[data-bar]');
  const barBtns = $(box, '[data-bar-btn]');
  const readout = one(box, '[data-readout]');
  if (!readout) return () => undefined;
  let tab = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset['tab'] ?? trend.tabs[0] ?? '';
  const series = (): number[] => trend.data[tab] ?? [];
  const label = (i: number): string => `${trend.weeks[i] ?? ''}: ${series()[i] ?? 0} ${tab.toLowerCase()}`;

  const render = (animate: boolean): void => {
    const data = series();
    const max = Math.max(1, ...data);
    bars.forEach((bar, i) => {
      const s = Math.max(0.04, (data[i] ?? 0) / max);
      if (animate && !reduced) gsap.to(bar, { scaleY: s, duration: 0.7, ease: EASE, overwrite: true });
      else gsap.set(bar, { scaleY: s });
    });
    values.forEach((el, i) => {
      const to = data[i] ?? 0;
      const from = num(el.textContent ?? '0');
      if (animate && !reduced) {
        const o = { v: from };
        gsap.to(o, { v: to, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => void (el.textContent = String(Math.round(o.v))) });
      } else el.textContent = String(to);
    });
    barBtns.forEach((b, i) => b.setAttribute('aria-label', label(i)));
    readout.textContent = p.hoverBar;
  };

  const tabHandlers = tabs.map((t) => {
    const onClick = (): void => {
      if (t.dataset['tab'] === tab) return;
      tab = t.dataset['tab'] ?? tab;
      tabs.forEach((x) => x.setAttribute('aria-selected', x === t ? 'true' : 'false'));
      render(true);
    };
    t.addEventListener('click', onClick);
    return () => t.removeEventListener('click', onClick);
  });
  const barHandlers = barBtns.map((b, i) => {
    const on = (): void => {
      readout.textContent = label(i);
      values[i]?.classList.add('text-primary');
    };
    const off = (): void => {
      readout.textContent = p.hoverBar;
      values[i]?.classList.remove('text-primary');
    };
    b.addEventListener('pointerenter', on);
    b.addEventListener('focus', on);
    b.addEventListener('pointerleave', off);
    b.addEventListener('blur', off);
    return () => {
      b.removeEventListener('pointerenter', on);
      b.removeEventListener('focus', on);
      b.removeEventListener('pointerleave', off);
      b.removeEventListener('blur', off);
    };
  });
  render(false);
  return () => {
    tabHandlers.forEach((h) => h());
    barHandlers.forEach((h) => h());
  };
}

/** Interactions. These run under reduced motion too. */
export function initPlatform(root: HTMLElement, reduced: boolean): () => void {
  pipeline(root);
  const cleanups = [scheduling(root, reduced), career(root, reduced), roles(root), email(root), analytics(root, reduced)];
  return () => cleanups.forEach((c) => c());
}

/** Tiles rise in once as they enter. Motion only. */
export function initBentoReveal(root: HTMLElement): void {
  const tiles = $(root, '[data-tile]');
  gsap.set(tiles, { autoAlpha: 0, y: 24 });
  ScrollTrigger.batch(tiles, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => void gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: EASE }),
  });
}
