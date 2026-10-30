# 03 Home page: the hands-on landing page

The home page lives at `/`. It follows the world in `DESIGN.md` and a standard landing-page structure. It stands out through **interaction, depth and scroll**, not through new colours, fonts or metaphors.

Every interaction must demonstrate a real Novara feature, and it must be fun to play with. This is not a story page: no narrative, no characters.

**Read first:**
- `PRODUCT.md`;
- `DESIGN.md`;
- `docs/implementation/00-foundation.md`;
- `.impeccable/surfaces/src-pages-index-astro.md` (the direction contract);
- `.claude/skills/impeccable/reference/craft-floor.md` (before your first UI edit).

**Motion craft:** read `.agents/skills/apple-design/SKILL.md`, `.agents/skills/animate/SKILL.md`, `.agents/skills/animation-performance/SKILL.md` and `.agents/skills/emil-design-eng/SKILL.md`. Skim `.agents/skills/animation-vocabulary/SKILL.md`. Where these conflict with this doc, this doc wins.

**Reuse:**
- `src/components/shared/ui/*` and `src/data/demo.ts`.
- `Section.astro`, `Button.astro` and `home.css` in `src/components/home/` (for Geist and the hairline column).

## Three kinds of motion (mix them; each section uses the one that fits)
- **Scrubbed:** tied to scroll position, and it reverses exactly when you scroll back. Use ScrollTrigger with `scrub` (about 0.6–1 for smoothing). It is used by:
  - the hero reassembly;
  - the Results zoom;
  - the Interview zoom-out;
  - the How it works horizontal track;
  - section-heading depth parallax.
- **Triggered:** plays once on entry. Used for section reveals, bento tile entrances and the FAQ.
- **Interactive:** driven by the user. Covers:
  - drag, toggles, the cheat detection, and the bento interactions. Nothing follows the pointer: no cursor pill, magnetic buttons, tilt or pointer parallax, and no ghost-cursor demos.

**Pins** only from 768px. Below that, a scrubbed sequence plays as the section passes, without a pin, or simplifies.

**Physics** follow apple-design: springs and momentum (GSAP `Draggable` plus `InertiaPlugin`, both free in the `gsap` package), rubber-banding at the bounds, and interruptible animations.

## Global interaction layer
- **Scroll depth:** `[data-speed]` elements drift at their own speed (scrubbed).

## Sections and owners
Copy lives in `src/content/home.ts`. The labs keep their own copy files.

1. **Nav:** the wordmark, anchor links and a "Request a demo" button.
2. **Hero:**
   - **Text:** the H1 "Hire the person, not the pile." and the sub-line, plus a link "Try the AI interview" with ↓, pointing to `#interview-lab`. No form. The text block is centred (headline balanced at about 16ch, sub-line 36rem, buttons centred and wrap-safe, also on mobile) with nothing beside it; the full-width exploded product view sits centred below it.
   - **The exploded product view:** below the text, the CandidateReview screen split into 4–6 depth layers (the app frame, the applicant list, the profile card, the score ring, the integrity chip). Six to eight evidence chips float at different depths around it: "Matched: Node.js", "Missing: Kubernetes", "Job Fit 92", "Focus lost 0:42", "AI Interview 88", "Moved by Priya".
   - **Scrolled:** the layers converge and the chips dock into their places in the flat screen. Scrolling back explodes it again. The scrub ends where the horizon gradient's top edge sits flush under the sticky nav, and ScrollTrigger `snap` (`[0, 1]`, directional, 0.4-0.6s, `power2.inOut`, no inertia) settles every stop to the top or to that position; scrolling on past it continues normally.
   - **Background:** the gradient horizon, once, behind the shot.
3. **Results:**
   - **Final stages:** the 12 shortlisted sit in a capped 6 x 2 grid (cell at most 104px, avatar radius at most 27px), the four offers on a Violet Wash band with their Offered chip. The tooltip is centred over the hovered person with an arrow, flips below at the top edge and is clamped inside the canvas. The hover ring is a 2px primary-300 circle, never black.
   - **Title:** "From 1,200+ applicants to 4 hires."
   - **Pinned scrubbed canvas:** 1,200 dots, one per applicant.
     - **Phase 1:** 600 fade back, captioned "Screened against the job's requirements."
     - **Phase 2:** zoom into the 600, captioned "Took the AI interview."
     - **Phase 3:** 12 turn violet, and the zoom continues ("Shortlisted after the AI interview").
     - **Phase 4:** the 12 become initials avatars and 4 get "Hired" badges ("Hired after in-person interviews").
   - **Counters** scrub with the phases.
   - **Hover:** on the dots it shows an illustrative tooltip ("Applicant · Job Fit 41 · Missing: Node.js").
   - **The caption** "One real hiring round for engineering roles, run on Novara." stays visible.
   - **Reduced motion and no JS** show an annotated funnel list.
4. **Screen: `ScreeningLab`, `#screen`:**
   - **Title:** "Every resume, read against the job." **Sub:** "Toggle what the job needs and watch the ranking change."
   - **Requirement chips** (toggle buttons with `aria-pressed`): Node.js, TypeScript, PostgreSQL, API design, Kubernetes, Remote-friendly time zone.
   - **Six applicant rows** with a Job Fit Score each, computed deterministically from per-candidate matched and missing data.
     - Toggling a chip recomputes the scores (the numbers roll) and re-sorts with GSAP `Flip`.
     - Clicking a row expands its matched and missing items and its one-line reason.
   - **A "New applications" tray** with two resume cards. Drag one onto the job, or press its "Screen" button: its score ring fills and it slots into the ranking.
   - **A scrubbed intro:** the resume cards fan out of a stack as the section scrolls in.
   - **Note:** "Scores in this demo are illustrative."
5. **Interview: `InterviewLab`, `#interview-lab`, the centrepiece:**
   - **Scrubbed pinned intro:** it starts zoomed into the AI interviewer tile filling the viewport, with captions typing "Hi, I'm Novara's AI interviewer…". Scrolling zooms out to the full interview UI with its integrity panel, and then the demo goes live.
   - **Title:** "Try to cheat. Novara will notice."
   - **Sub:** "A live demo of the checks Novara runs during a real interview. Switch tabs, click away, copy the question or look away, and watch your report fill in. Nothing you do here is recorded or sent anywhere."
   - **Real detections while the demo is live:**
     - **Tab switched:** `visibilitychange`, logging the time away.
     - **Focus lost:** window `blur`/`focus`, logging the duration.
     - **Copied the question:** `copy` inside the lab.
     - **Pasted into the answer:** `paste` in the answer box.
     - **Left full screen:** a "Full screen" button using the Fullscreen API on the lab; exiting is flagged.
     - **Looking away:** the pointer leaves the interview frame for more than 2s. Fine pointers only, labelled "In this demo your cursor stands in for your eyes". This reads a real window event; it is a signal, not a cursor effect.
     - **"Simulate: camera off" and "Simulate: second face"** toggles. The page never touches the camera. They show an overlay on the interviewer and self-view tiles, and their events are tagged "simulated".
   - **Candidate screen (V4):** modelled on the product's interview screen. The AI interviewer is a full-bleed portrait (`labs/interview/InterviewerPortrait.astro`: a vector head-and-shoulders with a headset, palette tokens only; it renders `public/brand/interviewer.webp` instead when that file exists at build time, so a generated portrait drops in with no code change). REC pill top-left, running timer top-right, a "You" self-view (AO tile) bottom-left, the current question in a rounded caption bubble bottom-centre, and a frosted "Interview transcript" panel (Q1.. and "You" turns) over the bottom-right, collapsed behind a toggle below the video in a narrow container. While the interviewer speaks, a waveform pill, a ring around the headset area and a gentle breathing scale run (transform and opacity only; static under reduced motion).
   - **Integrity monitor (V4 and V3, compact):** a header row (title, Live, status pill "N events to review"), a two-line caption that separates what the browser detects from the demo-only switches, seven counter chips (4 columns wide, 3 medium, 2 small, container-query driven), the three Simulate switches as one row of pills, and a fixed-height event list (about 4 rows, scrolls inside, newest on top) with `aria-live="polite"`. The team panel never changes height; the candidate and team halves stretch to one height on desktop.
   - **Each event:**
     - the matching counter chip flips and pulses (scale and a warning flash);
     - a timeline row slides in on top with an mm:ss timestamp and a one-line explanation, and the status pill flips and pulses;
     - a toast appears in the frame ("Flagged for review: Tab switched, 4s");
     - the frame briefly takes a warning-tone border;
     - the event is announced to screen readers (`aria-live="polite"`).
   - **The interview itself:**
     - **Questions:** three, with typed captions and the waveform.
     - **Answering:** an optional answer box, and "Next question".
     - **Finishing:** "Finish interview" (available at any time) builds **"Your integrity report"**: summary counts, the timeline of the visitor's real events, and the line "Events are flagged for your team to review. Novara doesn't reject anyone for them." Then "Try again" resets.
     - **Sample AI Interview Score** panel, labelled "Sample scoring". Never pretend to score the visitor's typing.
   - **No-JS:** a static sample report.
   - **Reduced motion:** no zoom and instant states, with every detection still working.
6. **Decide:**
   - **Title:** "You decide who moves on. Novara shows you why." **Sub:** "Drag Amara to your HR round. That call is yours."
   - **The drag:** drag her card (Draggable with inertia, snapping to columns, rubber-banding) from Completed to HR Round. On the drop, a "Moved on by you" stamp lands with a spring.
   - **Alternatives:** keyboard (right arrow moves her to HR Round, left arrow moves her back) and touch (hold to drag), with the status line announcing the move.
   - **Evidence panel:** hovering or focusing a card zooms in its evidence (the ScoreTriplet).
   - **No JS:** all three evidence panels stay readable. **Reduced motion:** every interaction works; the drag lands without springs.
7. **How it works:** a pinned horizontal scrubbed track of nine steps that snaps step by step (ScrollTrigger `snap` on the pin, directional, 0.4-0.6s, about 0.9 viewport heights per step): each step settles with its vignette finished and holds before the next. The nine-dot rail fills at the settled step. Each step's vignette animates in proportion to scroll; for example, the job description lines write in as you scroll, and Amara's card slides into HR Round in step 8. Each step title is a button: in the pinned track it scrolls to that step's settled point (so the snap and the buttons agree); in the vertical list on phones it replays that step's vignette. Focusing a title scrolls to it too.
   - **Fit-to-frame:** every step visual sits in one `[data-fit]` frame (same height, `min(60vh, 34rem)`, 1px hairline, Plate Gray ground, `lg` radius). `motion/fit.ts` measures the visual's natural size and applies a `transform: scale()` of at most 1 (ResizeObserver, re-run on fonts) so the whole visual shows, centred and never cropped. Without JS the frame is an auto-height box. The card slide in step 8 divides by the fit scale. No purple border: the step numeral and rail mark the active step.
8. **Platform:** a bento of nine product views, and every tile genuinely interactive. The Roles and permissions tile was removed by the DM team and stays removed:
   - **Dashboard:** hover or focus a bar of the jobs chart for its stage counts.
   - **Pipeline:** cards lift on hover or focus.
   - **Scheduling:** pick a slot (radio group) and a booked toast appears; the earlier booking stays on record.
   - **Career page:** the Layout (List/Grid) and Theme (Auto/Light/Dark) radios switch the live preview, and "Copy embed code" copies the snippet for real, then shows "Copied" (or the failure line).
   - **Analytics:** tabs switch the view, and hovering a bar shows its week and value.
   - Tiles also run a presence-aware ambient loop while idle; it finishes its step and yields when a pointer or focus arrives, and does not run under reduced motion.
8b. **Audience:** a pinned stepped section (from 1024x600, fitted to one viewport under the nav; a small ResizeObserver scales the stage down, never up, when the tallest panel exceeds it): the four groups (For Company, By Role, Industry, Agencies) each get a stop, with the same snap behaviour as How it works (about 0.8 viewport heights per group), the active tab, a crossfading detail card (opacity and transform) and a thin progress line. The tabs stay real buttons; clicking one scrolls to its stop. Below that size it is the plain tablist (a horizontal scroller on small screens, no pin); with no JS or under reduced motion all four panels are visible stacked.
9. **FAQ, close, footer:** the FAQ is native `details`. The close uses DemoForm. The FAQ heading is left-aligned over two columns. The footer is a 12-column grid: brand left (cols 1-6), live link columns (up to 3) filling the right half evenly, a lone column against the right edge; it shows only links whose pages exist.

## Links to pages that do not exist
The nav, hero and footer link to pages that are not built yet. Each link in `home.ts` has `live: boolean`; only `live: true` links render, and a footer column with no live link is dropped. Enabling a page later is a one-word change (`live: true`). Every live internal link is also listed on the home page record in `src/lib/pages.ts`, so the build fails with `link-missing` if a link is marked live for a page that does not exist. See `07-company-pages.md`.

## Budgets and rules
- **Performance:**
  - Canvas DPR is capped at 2.
  - Pause the canvases and loops off screen (IntersectionObserver).
  - Animate only transform and opacity (canvas and SVG strokes are fine).
  - The page JS stays at or under about 150KB gzipped.
  - Pick no new libraries beyond `gsap` and its plugins.
- **Accessibility and input:**
  - Every interaction works by keyboard and touch.
  - Reduced motion: no scroll parallax, scrub, snap or pins, but every interaction still works with instant state changes.
  - With no JS, all content is readable.
- **Truth:** PRODUCT.md claims only. Demo data is labelled illustrative. Palette tokens only. No glows behind text. No invented logos or stats.
- **SEO:** `noindex` for now. One H1, H2 per section, `<figure>` around mockups.

## Structure
- `src/pages/index.astro` renders `src/components/home/HomePage.astro`, which composes the sections. Copy is in `src/content/home.ts`.
- **Lab contract** (`ScreeningLab`, `InterviewLab`):
  - Self-contained. Each lab has its own copy file and script in its folder under `src/components/home/labs/`.
  - It renders its own section through `Section.astro` with a `tone` prop ('white' | 'plate').
  - It boots via `onReady` from `src/scripts/motion.ts`, scopes everything to its root, and cleans up.
  - Its test page (`src/pages/lab-screening.astro`, `src/pages/lab-interview.astro`, noindex) imports `src/components/home/home.css`.
- `pnpm check` and `pnpm build` must pass. Run `.claude/skills/impeccable/scripts/impeccable detect --json` on files you change. No browser automation, no screenshots.
