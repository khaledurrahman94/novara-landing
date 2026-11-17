const DURATION = 320;
const EASING = 'cubic-bezier(0.25, 1, 0.5, 1)';

function enhance(details: HTMLDetailsElement, reduceMotion: MediaQueryList): void {
  const summary = details.querySelector('summary');
  if (!summary) return;
  const body = summary.nextElementSibling as HTMLElement | null;
  let height: Animation | null = null;
  let fade: Animation | null = null;

  const closedHeight = (): number => summary.offsetHeight + (details.offsetHeight - details.clientHeight);

  const toggle = (open: boolean): void => {
    const from = details.offsetHeight;
    height?.cancel();
    fade?.cancel();
    details.dataset['state'] = open ? 'opening' : 'closing';
    if (open) details.open = true;
    const to = open ? details.offsetHeight : closedHeight();

    details.style.overflow = 'hidden';
    height = details.animate({ height: [`${from}px`, `${to}px`] }, { duration: DURATION, easing: EASING });
    fade = body?.animate({ opacity: open ? [0, 1] : [1, 0] }, { duration: DURATION * 0.75, easing: EASING, fill: 'forwards' }) ?? null;

    height.onfinish = () => {
      if (!open) details.open = false;
      details.style.overflow = '';
      delete details.dataset['state'];
      fade?.cancel();
      height = null;
      fade = null;
    };
  };

  summary.addEventListener('click', (event) => {
    if (reduceMotion.matches) return;
    event.preventDefault();
    toggle(details.dataset['state'] === 'closing' || !details.open);
  });
}

export function initAccordions(root: ParentNode = document): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.querySelectorAll<HTMLDetailsElement>('details[data-accordion]').forEach((details) => enhance(details, reduceMotion));
}
