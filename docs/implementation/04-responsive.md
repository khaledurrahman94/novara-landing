# 04 Responsive scaling (home page and labs)

Goal: the page looks the same in proportion on a 1366 laptop and a 1920 or 2560 monitor, and holds at 360, 390, 768 and 1024.

## 1. Desktop fluid root (opt-in)
- `Base` prop `fluid` sets `<html data-fluid>`. `src/styles/fluid.css` is inert without it.
- From 1280px the root font grows `16px + (100vw - 1280px) * 0.01` (22.4px at 1920, capped at 28px near 2560). Below 1280 it stays 16px. A height cap `100svh / 45` (16px at 720 tall, 22.4px at 1080) keeps short and ultrawide screens in proportion. Paired media queries use `.98px` complements (`max-width: 1023.98px`) or `not all and (...)` to avoid fractional-px gaps at Windows display scaling; no range syntax (`width < 1024px`), which Safari before 16.4 rejects.
- Everything authored in rem (type, spacing, gaps, radii via rem classes, mockups) scales with it. Never mix px text with rem text in the same component: use `text-[0.8125rem]`, not `text-[13px]`. `Icon` and `ScoreRing` already size in rem.
- The same file pins display tokens, `--spacing-section` and `--spacing-gutter` to their 1280px rem value (the root does the growing), and sets `--nav-h`. Page columns are `max-w-[75rem]`.
- Media queries stay in px/rem breakpoints (they ignore the root size). `vw` clamps are only for the below-1280 range.

## 2. Scaling happens once
Mockups are authored in rem, so they follow the fluid root and nothing else scales them. Do not add px sizes inside mockups (they drift against rem text), and never zoom a Draggable or Flip scene. Keep `refreshPriority` order and the `ScrollTrigger.sort()` on `refreshInit`; `scripts/motion.ts` refreshes ScrollTrigger on resize and orientationchange.

## Home page and the labs
- Every page passes `fluid` to `Base`; px layout values are rem (columns 75rem, type 0.8125rem etc.). Canvas pixel constants multiply by `u = rootFont / 16` (results), parallax by `remScale()`; pin offsets use `navH()` (rem nav), never 64px.
- Mockups reflow with container queries instead of being scaled down, so phones never get shrunk text. Bento is 6 columns from 1280 (2 below), Decide stacks until 1024.
- Pins need room: Results and How pin from 768x620; the interview lab pins from 1024x680 (frame height capped in rem, `100svh - 28.5rem`), else it does a short scrub.
- Check at 1280x720, 1366x768, 1536x864, 1920x1080, 2560x1440 and 360, 390, 768, 1024.
