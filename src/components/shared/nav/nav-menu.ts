const DESKTOP = '(min-width: 1024px)';
const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const HOVER_CLOSE_MS = 160;
const HOVER_CLICK_MS = 600;

interface Menu {
  isOpen(): boolean;
  close(restoreFocus?: boolean): void;
}

export function lockScroll(lock: boolean): void {
  const root = document.documentElement;
  if (lock) {
    root.style.scrollbarGutter = window.innerWidth - root.clientWidth > 0 ? 'stable' : '';
    root.style.overflow = 'hidden';
  } else {
    root.style.overflow = '';
    root.style.scrollbarGutter = '';
  }
}

function initFeaturesMenu(header: HTMLElement, onChange: () => void): Menu | null {
  const trigger = header.querySelector<HTMLButtonElement>('[data-mega-trigger]');
  const panel = header.querySelector<HTMLElement>('[data-mega]');
  if (!trigger || !panel) return null;
  const desktop = window.matchMedia(DESKTOP);
  const finePointer = window.matchMedia(FINE_POINTER);
  let closeTimer = 0;
  let hoverOpenedAt = 0;

  const isOpen = (): boolean => !panel.hidden;
  const set = (open: boolean): void => {
    window.clearTimeout(closeTimer);
    if (open === isOpen()) return;
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    onChange();
  };

  trigger.addEventListener('click', () => {
    if (isOpen() && Date.now() - hoverOpenedAt < HOVER_CLICK_MS) return;
    set(!isOpen());
  });
  for (const el of [trigger, panel]) {
    el.addEventListener('pointerenter', () => {
      if (!finePointer.matches || !desktop.matches) return;
      if (!isOpen()) hoverOpenedAt = Date.now();
      set(true);
    });
    el.addEventListener('pointerleave', () => {
      if (!finePointer.matches) return;
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => set(false), HOVER_CLOSE_MS);
    });
  }
  header.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (isOpen() && !(next && (trigger.contains(next) || panel.contains(next)))) set(false);
  });
  document.addEventListener('pointerdown', (e) => {
    if (isOpen() && !header.contains(e.target as Node)) set(false);
  });

  return {
    isOpen,
    close: (restoreFocus = false) => {
      if (!isOpen()) return;
      set(false);
      if (restoreFocus) trigger.focus();
    },
  };
}

function initMobileMenu(header: HTMLElement, onChange: () => void): Menu | null {
  const burger = header.querySelector<HTMLButtonElement>('[data-burger]');
  const drawer = header.querySelector<HTMLElement>('[data-drawer]');
  if (!burger || !drawer) return null;
  const panels = Array.from(drawer.querySelectorAll<HTMLElement>('[data-panel]'));
  const panelOpen = drawer.querySelector<HTMLButtonElement>('[data-panel-open]');
  const panelBack = drawer.querySelector<HTMLButtonElement>('[data-panel-back]');

  const isOpen = (): boolean => !drawer.hidden;
  const showPanel = (name: string): void => {
    for (const p of panels) p.hidden = p.dataset['panel'] !== name;
  };
  const set = (open: boolean): void => {
    if (open === isOpen()) return;
    drawer.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', (open ? burger.dataset['labelClose'] : burger.dataset['labelOpen']) ?? '');
    lockScroll(open);
    if (open) showPanel('main');
    onChange();
  };

  burger.addEventListener('click', () => set(!isOpen()));
  panelOpen?.addEventListener('click', () => {
    showPanel(panelOpen.dataset['panelOpen'] ?? 'main');
    panelBack?.focus();
  });
  panelBack?.addEventListener('click', () => {
    showPanel('main');
    panelOpen?.focus();
  });
  drawer.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  });

  return {
    isOpen,
    close: (restoreFocus = false) => {
      if (!isOpen()) return;
      set(false);
      if (restoreFocus) burger.focus();
    },
  };
}

export function initNav(header = document.querySelector<HTMLElement>('[data-nav]')): void {
  if (!header) return;
  const menus: Menu[] = [];
  const sync = (): void => {
    header.dataset['menu'] = menus.some((m) => m.isOpen()) ? 'open' : 'closed';
  };
  for (const m of [initFeaturesMenu(header, sync), initMobileMenu(header, sync)]) if (m) menus.push(m);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menus.find((m) => m.isOpen())?.close(true);
  });
  window.matchMedia(DESKTOP).addEventListener('change', () => menus.forEach((m) => m.close()));
}
