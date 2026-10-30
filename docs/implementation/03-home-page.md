# 03 Home page: the animated landing page

The home page lives at `/`. It follows the world in `DESIGN.md` and a standard landing-page structure. It stands out through **animation, depth and scroll**, not through new colours, fonts or metaphors.

**Animations only, no interactivity** (DM team, 2026-10-29). Every demo plays by itself and shows a real Novara feature working. The visitor watches; nothing in a demo reacts to the pointer, keyboard, focus or typing. This is not a story page: no narrative, no characters.

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
  - the Results funnel;
  - the Interview zoom-out;
  - the How it works horizontal track;
  - section-heading depth parallax (`data-speed`).
- **Triggered:** plays once on entry. Used for section reveals, bento tile entrances and the Decide sequence.
- **Self-playing:** a scripted sequence or a small loop that starts by itself while the section is on screen: the screening lab, the interview walkthrough, and the Platform bento loops. Loops pause off screen.

**Pins** only from 768px. Below that, a scrubbed sequence plays as the section passes, without a pin, or simplifies.

## What is not on the page (removed on purpose)
No cursor pill, magnetic buttons, cursor tilt or pointer parallax; no drag (GSAP `Draggable` and `InertiaPlugin` are not used); no toggles, radios, inputs or copy buttons in demos; no hover tooltips or hover-only reveals; no click-to-replay steps; no live detection of the visitor's tab, focus, clipboard or full screen. **Kept:** links, buttons that navigate, the demo-request form, the FAQ (native `details`), the Audience tab list (it switches content, it is navigation, not a demo), and hover colour or underline on links and buttons.

## Sections and owners
Copy lives in `src/content/home.ts`. The labs keep their own copy files.

1. **Nav:** the wordmark, the page links and a "Request a demo" button. A link renders only when its `live` flag is true (see "Links to pages that do not exist" below).
2. **Hero:**
   - **Text:** the H1 "Hire the person, not the pile." and the sub-line, the Login button (and "See pricing" once `/pricing` exists), and a link "See the AI interview" with ↓, pointing to `#interview-lab`. No form.
   - **The exploded product view:** below the text, the CandidateReview screen split into 4–6 depth layers (the app frame, the applicant list, the profile card, the score ring, the integrity chip). Six to eight evidence chips float at different depths around it: "Matched: Node.js", "Missing: Kubernetes", "Job Fit 92", "Focus lost 3s", "AI Interview 88", "Moved by Priya".
   - **Scrolled:** the layers converge and the chips dock into their places in the flat screen. Scrolling back explodes it again. Scroll is the only input.
   - **The Job Fit card** beside the headline builds itself once on entry, then floats and replays its ring shimmer quietly. Unchanged.
   - **Background:** the gradient horizon, once, behind the shot.
3. **Results:**
   - **Title:** "From 1,200+ applicants to 4 offers."
   - **Pinned scrubbed canvas:** 1,200 dots, one per applicant.
     - **Phase 1:** 600 fade back, captioned "Screened against the job's requirements."
     - **Phase 2:** zoom into the 600, captioned "Took the AI interview."
     - **Phase 3:** 12 turn violet, and the zoom continues ("Moved to the HR round.")
     - **Phase 4:** the 12 become initials avatars and 4 get "Offered" badges.
   - **Counters** scrub with the phases. No tooltips, no hover, no tap.
   - **The caption** "Illustrative funnel for an engineering hire. Not a customer result." stays visible.
   - **Reduced motion and no JS** show an annotated funnel list.
4. **Screen: `ScreeningLab`, `#screen`:** a self-playing sequence, once, when the ranking scrolls into view.
   - **Title:** "Every resume, read against the job." **Sub:** "Add a requirement and the ranking changes. Add an applicant and Novara scores it."
   - **Requirement chips** (plain list items, not buttons): Node.js, TypeScript, PostgreSQL and API design start lit; Kubernetes and Experience level: Senior light up one after another.
   - **Six applicant rows** with a Job Fit Score each, computed deterministically from per-candidate matched and missing data (`model.ts`). Each time a requirement lights, the numbers roll and the list re-sorts with GSAP `Flip`; the top row's matched and missing items and reason are open.
   - **A new applicant** (Hana Fischer) slides into the ranking with a "New" badge and is scored.
   - A status line narrates each step. The lab ends on the top row open.
   - **Note:** "Novara scores out of 100. Names, resumes and weights here are illustrative."
   - **No JS:** the start state (six ranked rows, all details visible). **Reduced motion:** the end state (all requirements lit, seven ranked rows).
5. **Interview: `InterviewLab`, `#interview-lab`, the centrepiece:**
   - **Scrubbed pinned intro:** it starts zoomed into the AI interviewer tile filling the viewport, with the caption typing "Hi, I'm Novara's AI interviewer…". Scrolling zooms out to the full interview UI with its integrity panel, and then the walkthrough plays.
   - **Title:** "Cheating in an interview gets noticed."
   - **Sub:** a scripted walkthrough of what the integrity monitor flags in a real interview. "Nothing here is recorded or sent anywhere."
   - **The walkthrough** is one GSAP timeline driven by the `script` in `labs/interview/copy.ts`, played once:
     - three questions, spoken by the interviewer (waveform, typed caption), each answer transcribed word by word;
     - the integrity monitor's events tick up on a clock: Tab switched, Focus lost, Copied the question, Camera off, Multiple faces, Left full screen, Looking away;
     - each event travels from the candidate's screen to the team view as a pulse, flips its counter, adds a timeline row and shows a toast;
     - the self-view shows "Camera off" and "2 faces" overlays while those events are live;
     - then the integrity report appears, with a sample evaluation ("Sample evaluation", never a score of the visitor).
   - **Honest caption:** the team view says it is a scripted replay and lists what Novara checks in a real interview. Nothing is detected from the visitor and the page never touches the camera.
   - **No JS and reduced motion:** a static sample integrity report built from the same script.
   - **Pause:** the timeline pauses whenever the lab is off screen or the intro is not fully out.
6. **Decide:**
   - **Title:** "You decide who moves on. Novara shows you why." **Sub:** "Novara shows the evidence. Moving someone on is your call."
   - **The sequence** (once, when the board scrolls in): the evidence panel spotlights Ines, Kenji and Amara in turn; Amara's card moves from Completed to HR Round; a "Moved on by you" stamp lands with a spring; her score is revealed again.
   - **No JS:** all three evidence panels stay readable. **Reduced motion:** Amara is already in HR Round, stamped.
7. **How it works:** a pinned horizontal scrubbed track of nine steps that snaps step by step (ScrollTrigger `snap` on the pin, directional, 0.4-0.6s, about 0.9 viewport heights per step): each step settles with its vignette finished and holds before the next. The nine-dot rail fills at the settled step. Each step's vignette animates in proportion to scroll; for example, the job description lines write in as you scroll. On mobile it is a vertical list with the same vignettes, played on entry. Steps are plain headings, not buttons.
8. **Platform:** a bento of nine product views; the six that move each play their own loop while on screen:
   - **Dashboard:** a callout with the stage counts moves over each bar of the jobs chart in turn.
   - **Pipeline:** a card moves on to the next stage.
   - **Scheduling:** the booked slot moves to the next time, a confirmation appears and the old booking stays on record.
   - **Career page:** Layout (List/Grid) and Theme (Auto/Light/Dark) switch by themselves, and the embed code is "copied" (the button shows "Copied"; the clipboard is never touched).
   - **Roles:** the selected role changes and its permissions follow.
   - **Analytics:** the view switches between stages, the bars morph and each bar is highlighted in turn with its week.
8b. **Audience:** a pinned stepped section (from 1024x800): the four groups (For Company, By Role, Industry, Agencies) each get a stop, with the same snap behaviour as How it works (about 0.8 viewport heights per group), the active tab, a crossfading detail card (opacity and transform) and a thin progress line. The tabs stay real buttons; clicking one scrolls to its stop. Below that size it is the plain tablist (a horizontal scroller on small screens, no pin); with no JS or under reduced motion all four panels are visible stacked.
9. **FAQ, close, footer:** the FAQ is native `details`. The close uses DemoForm. The footer shows only links whose pages exist.

## Links to pages that do not exist
The nav, hero and footer link to pages that are not built yet. Each link in `home.ts` has `live: boolean`; only `live: true` links render, and a footer column with no live link is dropped. Enabling a page later is a one-word change (`live: true`). Every live internal link is also listed on the home page record in `src/lib/pages.ts`, so the build fails with `link-missing` if a link is marked live for a page that does not exist. See `07-company-pages.md`.

## Budgets and rules
- **Performance:**
  - Canvas DPR is capped at 2.
  - Pause the canvases and loops off screen (IntersectionObserver).
  - Animate only transform, opacity, clip-path and strokes (canvas and SVG strokes are fine).
  - The page JS stays at or under about 150KB gzipped.
  - Pick no new libraries beyond `gsap` and its plugins (only `ScrollTrigger` and `Flip` are used besides core).
- **Accessibility and input:**
  - Reduced motion: no scrub, pins or loops; every section shows its end state.
  - With no JS, all content is readable.
  - Demos have no focusable controls; their captions say what plays.
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
