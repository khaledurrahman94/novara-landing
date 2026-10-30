---
name: Novara
description: AI hiring platform landing. A conventional B2B page where the rebuilt product UI is the proof.
colors:
  primary: "#7237FB"
  primary-600: "#5F1FEF"
  primary-300: "#C0A6FE"
  primary-200: "#DACBFF"
  primary-50: "#F5F1FF"
  brand-from: "#8C75FB"
  brand-to: "#421DF8"
  success: "#17B26A"
  warning: "#F79009"
  blue-light: "#0BA5EC"
  white: "#FFFFFF"
  bg: "#F9FAFB"
  bg-tertiary: "#F2F4F7"
  border-primary: "#D0D5DD"
  border-secondary: "#E4E7EC"
  gray-200: "#EAECF0"
  gray-400: "#98A2B3"
  text-primary: "#101828"
  text-secondary: "#344054"
  text-tertiary: "#475467"
  text-placeholder: "#667085"
  gray-950: "#0C111D"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.2rem + 5.2vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.2rem + 2.8vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline-sm:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 1.3rem + 1.8vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  figure:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  ui:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
  ui-body:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.375
  ui-caption:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.375
  ui-micro:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  gutter-sm: "20px"
  gutter-md: "32px"
  gutter-lg: "48px"
  section-sm: "80px"
  section-lg: "128px"
  column: "1200px"
  nav-height: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-600}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.bg}"
  input-email:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  button-submit:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  chip:
    backgroundColor: "{colors.bg-tertiary}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  figure-plate:
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.xl}"
    padding: "24px"
  nav:
    backgroundColor: "{colors.white}"
    height: "{spacing.nav-height}"
---

# Design System: Novara

## Overview

**Creative North Star: "The Ruled Column"**

A white page with one centred 1200px column, framed full-height by two 1px hairlines and cut into sections by full-width hairlines. Inside that frame the page is quiet: Geist in near-black, semibold headings with tight negative tracking, and plenty of air. The product carries the visual weight. Every section's image is the rebuilt Novara app in Inter, set on a pale plate, and it animates once to show the feature working.

The density is low and the rhythm even. Sections alternate between white and the pale gray plate (#F9FAFB), so the page reads as a stack of ruled bands, not floating cards. Violet is rare. It marks actions (buttons, focus, caret, selection) and data (funnel bars, the hired bar, chart bars, active states inside the product UI). The brand gradient appears exactly once, as a masked horizon glow behind the hero product shot.

This system documents the home page (`/`). It is animated, not interactive: every feature plays by itself, on scroll or on a timer, and nothing on the page reacts to the pointer beyond ordinary link, button and form behaviour. The DM team asked for animations only, so the page has no drag, toggle, hover-reveal, cursor-follow or try-it demos (see Animation layer and Motion).

**Key Characteristics:**
- One 1200px column framed by border-secondary hairlines, with a hairline at the top of every section.
- White and #F9FAFB bands alternate, and there are no section backgrounds beyond those two.
- Geist for the page and Inter for the product UI. The two never swap roles.
- Violet only on actions and data, and the gradient only once.
- Product UI as the imagery: real text, live counters, no illustrations or stock imagery.

## Colors

The palette comes from the product's Untitled UI–based design system and is binding: cool grays, one violet, three status hues.

### Primary
- **Novara Violet** (primary): primary buttons, the submit button, focus rings, caret, the hired bar in the funnel, chart bars, slot selection, switches that are on, and the primary button inside product UI.
- **Pressed Violet** (primary-600): hover state of every violet button.
- **Soft Violet** (primary-300): funnel bars for the stages before "hired", so the final bar is the only full-strength one.
- **Selection Lilac** (primary-200): the text-selection ground and the input focus outline.
- **Violet Wash** (primary-50): the active row and rail item in product UI, template variable chips, and the primary chip ground.

### Secondary
- **Brand Gradient** (brand-from → brand-to, 135deg): the hero horizon only. It's masked to a radial ellipse at 50% opacity behind the candidate-review screen.

### Tertiary
- **Status hues** (success, warning, blue-light): product-UI status only. They're shown as a 10% tint ground with a full-strength dot and dark text. Warning also marks an invalid email field and the flagged integrity event.

### Neutral
- **White** (white): the page ground and every product-UI surface.
- **Plate Gray** (bg): alternate section bands, figure plates, the footer, and the hover ground of the secondary button.
- **Inset Gray** (bg-tertiary): segmented-control troughs and gray chip grounds in product UI.
- **Hairline** (border-secondary): the column frame, section dividers, figure borders, FAQ rules and funnel rules.
- **Field Line** (border-primary): input and secondary-button borders, the how-it-works connector line and step numerals, and the candidate-review frame.
- **Ink** (text-primary): headings, figures and primary copy.
- **Slate** (text-secondary): leads, body, answers and secondary buttons.
- **Muted Slate** (text-tertiary): notes, captions, nav links at rest and the footer small print.
- **Placeholder** (text-placeholder): input placeholders and idle rail icons.
- **Night** (gray-950): the AI-interview video frame only.

### Named Rules
**The Actions-and-Data Rule.** Violet appears on things you can press and on numbers that matter. It never fills a section, a heading or decorative shape.

**The One Horizon Rule.** The brand gradient is used once per page, masked, behind product UI. Never behind text and never on a button.

**The Tint-Not-Fill Rule.** Status color is a 10% tint with a dot and dark text, so contrast stays above 4.5:1.

## Typography

**Display Font:** Geist Variable (with system-ui)
**Body Font:** Geist Variable (with system-ui)
**Product UI Font:** Inter Variable (with system-ui)

**Character:** Geist is neutral and engineered. Semibold weight and -0.03em tracking make its large sizes feel dense and confident, not loud. Inter sits inside the product screens at small sizes, so the shots read as the real app, not as marketing type.

### Hierarchy
- **Display** (600, clamp 44–72px, 1.02): the hero H1 only, max 46rem wide.
- **Headline** (600, clamp 32–56px, 1.05): the big section statements (Results, Platform, Close).
- **Headline Small** (600, clamp 30–44px, 1.08): feature sections, How and FAQ.
- **Title** (600, 17px, -0.01em): bento tile titles and step titles. FAQ questions use the same size at 500.
- **Lead** (400, 18px, 1.625): the line under each heading, 30–34rem max width, in Slate.
- **Body** (400, 15px, ~1.4): tile lines, step text, FAQ answers (40rem max) and the footer line.
- **Label** (500, 14px): buttons, nav links and funnel labels.
- **Figure** (600, 44px, 1, tabular): funnel counts.
- **UI** (Inter, mostly 500–600): everything inside product screens, on its own small scale (below).

### Product-UI Scale
The rebuilt product screens use a fixed Inter scale, so a shot reads at the real app's density, not the page's.
- **UI Body** (13px, ~1.4): row text, panel copy, list items and buttons inside product UI.
- **UI** (12px): chips, segmented controls, tab labels and lab tags.
- **UI Caption** (11px, ~1.4): metadata, timestamps and secondary lines under a row.
- **UI Micro** (10px): the smallest counts and labels in dense panels.

Larger numbers inside a panel (a 28px score, a 32px figure) are figures, not text steps. Page copy never uses these sizes.

### Named Rules
**The Two Faces Rule.** Geist speaks for the page and Inter speaks for the product. Don't set marketing copy in Inter or product UI in Geist.

**The Product Scale Rule.** Inside product UI, text sits on the 10, 11, 12 and 13px Inter steps. These sizes belong to the product; they are not exceptions to the page ramp.

**The Single Weight Rule.** Headings are always 600 with negative tracking. Hierarchy comes from size and color, never from adding bold or light weights.

## Layout

The page is one centred column, max 1200px, with 1px border-secondary hairlines on both sides running the full height of the page through the nav, every section and the footer. Each section has a full-width top hairline and pads 80px vertically (128px from md). Horizontal gutters are 20px, then 32px (sm) and 48px (md). The sticky nav is 64px tall and starts transparent. It gains a white ground and bottom hairline once the page has scrolled 8px. Anchor scrolls offset by 64px.

Section compositions draw from a small set: a 4/8 split of heading and figure (lg 12-column grid), a 7/5 split of heading and lead over a full-width figure, a centred heading (44rem max) over a full-width figure, ruled rows (funnel and FAQ), a 4-column numbered step row, and a hairline bento. The bento runs edge to edge inside the frame on a 6-column grid with 1px gaps that show the hairline color. Below lg, everything stacks to one column. Text measure is held by max-widths (30–46rem), not by the grid.

### Responsive scale
Every page passes `fluid` to `Base`, which sets `<html data-fluid>` and turns on `src/styles/fluid.css`. Below 1280px the root stays 16px. From 1280px it is `clamp(16px, min(16px + (100vw - 1280px) * 0.01, 100svh / 45), 28px)`: 22.4px at 1920x1080, capped by height so short and ultrawide screens never outgrow the viewport. Display tokens, `--spacing-section` and `--spacing-gutter` hold their 1280px rem values so the root does the growing; `--nav-h` is 4rem and page columns are 75rem (1200px at 16px). Type, spacing and mockups are authored in rem, never px, so they all scale together. Canvas constants multiply by root/16, and pin offsets read the nav height, not 64px.

Mockups reflow with container queries and are never scaled down, so phones never get shrunk text. Flip scenes are never zoomed.

Media queries never use range syntax. A max query is the `.98px` complement of its min query (`(max-width: 1023.98px)` against `(min-width: 1024px)`), or `not all and (...)` negates the exact pin query, so no fractional viewport falls between the two.

**The Root-Grows Rule.** The fluid root grows everything. Nothing else scales, so nothing scales twice.

**The Gap-Free Query Rule.** Paired breakpoints are written as `.98px` complements or `not all and (...)`, never as range syntax.

## Elevation & Depth

The page itself is flat. Depth comes from the hairline frame and from alternating white and plate bands. Shadows belong to product UI only: soft, low-opacity and tinted with Ink (#101828). The hero candidate-review screen is the one lifted object (shadow-xl), and it starts exploded into layers at different depths and reassembles as you scroll.

### Shadow Vocabulary
- **Hairline lift** (`0 1px 2px rgb(16 24 40 / 0.05)`): buttons, inputs and small product cards.
- **Panel** (`0 4px 8px -2px rgb(16 24 40 / 0.08), 0 2px 4px -2px rgb(16 24 40 / 0.04)`): standalone product panels such as the job-fit card, integrity track and move board.
- **Overlay** (`0 12px 16px -4px rgb(16 24 40 / 0.08), 0 4px 6px -2px rgb(16 24 40 / 0.04)`): the interview video frame and toasts.
- **Hero lift** (`0 24px 48px -12px rgb(16 24 40 / 0.14)`): the hero candidate-review screen only.

### Named Rules
**The Flat Page Rule.** Marketing surfaces (sections, plates, bento tiles, the FAQ) never cast shadows. Only product UI is lifted.

## Shapes

The page structure is square, made of straight hairlines and square section edges. Rounding belongs to objects. Figure plates and the hero screen use a soft 24px radius (xl), product panels 16px (lg), buttons, inputs and rows 10px (md), and small tags 6px (sm). Chips, avatars, step numerals and switches are full pills or circles. Every border is 1px, except the integrity markers (2px rings).

## Components

### Buttons
- **Shape:** gently rounded (10px).
- **Primary:** Novara Violet ground, white 14px/500 label, 40px tall with 16px padding, hairline-lift shadow.
- **Hover / Focus:** the ground darkens to Pressed Violet over 150ms (ease-out-quart). Focus is a 2px violet outline offset 2px.
- **Secondary:** white ground, Field Line border, Slate label, and the ground shifts to Plate Gray on hover.
- Hero "Request a demo" (secondary, beside "See pricing") scrolls to the close form. There is no hero form. The header has Sign in and Get started buttons and no demo button.

### Inputs / Fields
- **Style:** the demo form is a work-email field plus a submit button on one row (stacked on phones), 44px tall, 10px radius, Field Line border, white ground, 15px text, max width 30rem.
- **Focus:** the border turns violet, with a 2px Selection Lilac outline at zero offset.
- **Error / Disabled:** an invalid field gets a warning-colored border and a message below in Slate. A submit in progress is disabled on primary-400. Success replaces the row with a plate-gray note and a success check.

### Chips
- **Style:** a pill, a 10% status tint (or Violet Wash, or Inset Gray), a 6px colored dot, and 12px/500 Inter text in Slate.
- **State:** the tone maps one-to-one to pipeline stage, everywhere.

### Cards / Containers
- **Figure plate:** 24px radius, hairline border, 12px padding (24px from sm), Plate Gray on white bands or white on plate bands. It always holds product UI and has a screen-reader caption.
- **Bento tile:** white, 24px padding (32px from sm), separated by 1px hairline gaps, not borders or shadows. Each holds a title, a line and a 16px-radius Plate Gray inset with one product view. Each tile plays one small loop of its own while it is on screen. Tiles have no hover or focus states.

### Navigation
- **Style:** a sticky 64px bar inside the column frame, with the wordmark at 28px tall, 14px/500 anchor links in Muted Slate that turn Ink on hover, and Sign in (secondary, hidden below lg) and Get started (primary) buttons on the right. Links hide below md.

### Ruled Rows (signature)
Results and the FAQ are lists ruled by hairlines, top and bottom. Funnel rows pair a 44px tabular figure, a label and a note with a 36px bar on white. The bar's width is proportional to the figure, Soft Violet for each stage and Novara Violet for the last. The FAQ is a centred heading over two balanced columns from md up (one column below). Rows are native `details` elements with a plus icon on the left in the brand primary colour that becomes a minus when open, and a 17px question. They expand smoothly where supported.

### Animation layer
The page shows the product working; the visitor does not operate it. Nothing below follows the pointer.
- **Scroll depth:** `data-speed="s"` drifts an element from −s×90px to +s×90px across its pass through the viewport, scrubbed so it reverses exactly. It's used sparingly (0.1), and only from 768px.
- **Self-playing demos:** the screening lab, the interview lab and Decide each play a scripted sequence once, when they scroll into view, and end on a readable final state. The screening lab lights up requirements one by one while the real scoring model re-ranks the list (Flip) and a new applicant arrives and is scored. The interview lab runs a timed walkthrough: the interviewer speaks, the answer is transcribed, the integrity monitor's events tick up on a clock and the report appears. Decide spotlights each candidate's evidence, moves Amara to HR Round and reveals the score again. The numbers always come from the same data and logic as the static markup.
- **Ambient tiles:** the Platform bento tiles run a small loop, one step at a time: the jobs chart calls out each bar, a pipeline card moves on, a slot is booked and confirmed, the career page switches Layout and Theme and "copies" its embed code, the selected role changes, and the analytics view changes and highlights each bar in turn. An IntersectionObserver pauses a loop off screen and while the tab is hidden. Loops are silent: no live-region text and no clipboard writes.
- **Interactive on purpose:** only ordinary UI is interactive: links, buttons that navigate, the demo-request form, the FAQ disclosure (native `details`) and the Audience tab list, which switches content and is navigation, not a demo. Hover colour and underline on links and buttons are fine.

**The Show Once Rule.** A scripted demo plays one time, ends on a readable state, and leaves nothing in a live region (a status line is allowed to announce the final state).

**The No Hidden Information Rule.** Nothing is revealed only on hover. If a value matters, it is on the page, or an animation brings it up on its own.

### Motion
The page uses three kinds of motion, and each element uses one kind. All of it is transform, opacity, clip-path or stroke based.
- **Scrubbed (reversible):** tied to scroll position, so it plays backwards on the way up. The hero screen reassembles from its exploded layers, the Results dots become 4, the interview lab zooms out of its window, How It Works runs as a horizontal track, and `data-speed` elements drift. Scrub smoothing is 0.6–0.8.
- **Triggered:** plays once on entry and stays. Headings and intro blocks (`data-reveal`) rise 20px at 85% of the viewport over 0.8s, expo-out. Bento tiles enter in a staggered batch, and How steps play their vignette at 75%. A 4s failsafe reveals anything a trigger missed.
- **Self-playing:** scripted demos and the bento loops above. They start by themselves, never wait for input, and pause off screen.

Pins run only at `(min-width: 768px) and (min-height: 620px)`. Below that, and on short screens, the same sections render as plain stacked content with simple entries. Pins carry `refreshPriority` in DOM order (Results 3, Interview 2, How 1) with `anticipatePin`. `ScrollTrigger.sort()` runs on every `refreshInit`, because pins from the page and both labs are created in no fixed order and re-created on breakpoint changes. A refresh follows window load and font loading.

Hidden start states are set only under JS with motion allowed. Lenis smooth scroll runs except under reduced motion.

Under reduced motion nothing loops or scrubs: every section shows its end state (the screening list fully re-ranked, the interview lab as its static report, Amara in HR Round, the funnel list), pins and Lenis are off, and the bento tiles keep their start state.

Performance: canvases cap device pixel ratio at 2 and redraw on scroll, not on a loop. The interview lab, the screening lab and the bento loops watch visibility with IntersectionObserver and do no work off screen. Each section's init is isolated, so one failure never takes the page down.

### Pinned scenes
Results, the interview lab and How It Works pin on large screens (see Motion). The interview lab pins at `(min-width: 1024px) and (min-height: 680px)`, with `not all and (...)` giving a short scrub elsewhere. Results pins from 768x620 and scrubs without step snapping. Every pin carries `refreshPriority` in DOM order, and `ScrollTrigger.sort()` runs on `refreshInit`.

**Snap per step.** How It Works (9 steps) and the Audience section (4 groups) use ScrollTrigger `snap` on their pin: `snapTo` is the list of settled-step progress values plus both ends (so the visitor can always scroll out), `directional: true`, `duration` 0.4-0.6, `delay` 0.08, `power2.inOut`, `inertia: false`. Each slot holds still after its transition, and the step's vignette finishes before it settles. How scrolls about 0.9 viewport heights per step (0.7 below 1024px wide), Audience 0.8 per group and pins only from 1024x800 (below that, or without JS, it is the plain tablist; under reduced motion all four panels are stacked). Audience tabs stay real buttons: clicking one scrolls to that group's stop. The snap starts only after Lenis has stopped easing, so the two do not fight.

**The Header-in-Pin Rule.** A pinned scene pins its heading with its steps. The visitor never scrubs through a step without the line that names it.

### Interview lab (two surfaces)
The interview lab shows two surfaces side by side. The candidate's screen is a spoken, transcribed AI interview with no integrity UI at all. The hiring team's view carries the integrity monitor (event tiles, counters, the report). A pulse travels between the two whenever an event lands, linking cause to record. The events (tab switch, focus lost, copy and paste, camera off, a second face, left full screen, looking away) are a scripted replay on a clock, not detected from the visitor, and the copy says so. The timeline pauses while the lab is off screen.

**The Two-Surface Rule.** Integrity UI never appears on the candidate's surface. It lives only in the team's view, and a pulse is the only thing that crosses between them.

### Slot picker
The candidate-facing slot picker (`shared/ui/SlotPicker.astro`) confirms a booking with an in-flow row at the bottom of the card. It never overlays or covers the slots.

### Shared layers
The tokens (`src/styles/tokens.css`), the product UI components (`src/components/shared/ui/`, Inter), the demo data and the motion bootstrap (GSAP, ScrollTrigger and Lenis in `src/scripts/motion.ts`) are shared by every section of the page. Page sections live in `src/components/home/`.

## Do's and Don'ts

### Do:
- **Do** keep every section inside the 1200px hairline-framed column, with a full-width top hairline.
- **Do** alternate white and Plate Gray (#F9FAFB) bands, and only those two.
- **Do** show features as rebuilt product UI in Inter on a plate, with real text and a screen-reader caption.
- **Do** keep violet to actions and data, and make the final or most important bar the only full-strength one.
- **Do** set headings in Geist 600 with -0.03em tracking and balanced wrapping.
- **Do** play triggered motion once, on entry, with expo-out, and leave every end state visible without JS or under reduced motion.
- **Do** give each element one motion kind (scrubbed, triggered or self-playing), and make scrubbed motion fully reversible.
- **Do** keep every demo self-playing, and show every value on the page or let an animation bring it up on its own.
- **Do** set product-UI text on the 10, 11, 12 and 13px Inter steps.
- **Do** author page and mockup sizes in rem under `data-fluid`.
- **Do** write paired breakpoints as `.98px` complements or `not all and (...)`.
- **Do** keep a pinned scene's heading inside the pin, and leave the first and last steps free of snapping.
- **Do** play a scripted demo once, and end it on a readable state.

### Don't:
- **Don't** use the brand gradient anywhere but the single hero horizon, and never behind text.
- **Don't** put shadows on marketing surfaces. Shadows are for product UI.
- **Don't** fill status chips with full-strength color. Use the 10% tint, a dot and dark text.
- **Don't** pin below 768px wide or 620px tall, and never trap vertical swipes on touch.
- **Don't** add pointer-driven effects (cursor pill, tilt, magnetic buttons, drag, hover reveals), or interactive demos with toggles, inputs or detection of the visitor's own actions.
- **Don't** introduce colors outside the token palette. The palette is binding.
- **Don't** use range media syntax (`width < 1024px`), px text inside a rem mockup, or zoom on a Flip scene.
- **Don't** let ambient events reach a live region or the clipboard, or run loops under reduced motion.
- **Don't** put integrity UI on the candidate's surface, or show a slot confirmation as an overlay.
