# 04 Responsive scaling (V1 now, V2/V3 later)

Goal: the page looks the same in proportion on a 1366 laptop and a 1920 or 2560 monitor, and holds at 360, 390, 768 and 1024.

## 1. Desktop fluid root (opt-in)
- `Base` prop `fluid` sets `<html data-fluid>`. `src/styles/fluid.css` is inert without it.
- From 1280px the root font grows `16px + (100vw - 1280px) * 0.01` (22.4px at 1920, capped at 28px near 2560). Below 1280 it stays 16px.
- Everything authored in rem (type, spacing, gaps, radii via rem classes, mockups) scales with it. Never mix px text with rem text in the same component: use `text-[0.8125rem]`, not `text-[13px]`. `Icon` and `ScoreRing` already size in rem.
- The same file pins display tokens, `--spacing-section` and `--spacing-gutter` to their 1280px rem value (the root does the growing), and sets `--v1-max` (column width) and `--nav-h`. Use `max-w-[var(--v1-max,84rem)]` for page columns.
- Media queries stay in px/rem breakpoints (they ignore the root size). `vw` clamps are only for the below-1280 range.

## 2. ScaleToFit (`src/components/shared/ScaleToFit.astro`)
- Wrap a mockup: `<ScaleToFit design={28}>` (design width in rem). A ResizeObserver writes `--fit` and `--fit-w` on the wrapper; CSS applies `zoom: var(--fit)`. Never scales up.
- Width mode: scale = frame / design width, floored at `min` (0.8); under the floor the content reflows narrower so text stays legible.
- Height mode: when CSS sets `--fit-constrain: 1` and a definite height (pinned scenes), it also shrinks to fit the height (floor 0.5).

## 3. Pinned scenes (`src/components/v1/scene.css`, `motion/scene.ts`)
- Structure: `section[data-scene] > .scene-stage > .scene-inner > .scene-head + .scene-body`. JS sets `data-pinned` on the section only at >=1024px wide, >=680px tall, motion allowed (`PIN_MQ`). Else it stacks; reduced motion is static.
- `pinScene(stage, steps, viewportsPerStep, onStep)` pins under the header, reports step progress and eases to the nearest step centre after scrolling settles. Used by How (0.35/step), Job Fit (0.5/step), Platform (0.4/step).

## Adopting on V2/V3
Pass `fluid` to `Base`, convert px text and icon sizes to rem, wrap mockups in `ScaleToFit`, swap `max-w-[84rem]` for `var(--v1-max, 84rem)`. Check at 1280x720, 1366x768, 1536x864, 1920x1080, 2560x1440 and 360, 390, 768, 1024.
