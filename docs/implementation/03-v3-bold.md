# 03 V3: the bold, hands-on version

V3 lives at route `/v3`. It uses the **same world as V2** (read `DESIGN.md`): the same content base, and a standard landing-page structure. It's bolder in **interaction, depth, cursor and scroll**, not in new colours, fonts or metaphors.

Every interaction must demonstrate a real Novara feature, and it must be fun to play with. This is not a story page: no narrative, no characters.

**Read first:**
- `PRODUCT.md`;
- `DESIGN.md`;
- `docs/implementation/00-foundation.md`;
- `.impeccable/surfaces/src-pages-v3-index-astro.md` (the direction contract);
- `.claude/skills/impeccable/reference/craft-floor.md` (before your first UI edit).

**Motion craft:** read `.agents/skills/apple-design/SKILL.md`, `.agents/skills/animate/SKILL.md`, `.agents/skills/animation-performance/SKILL.md` and `.agents/skills/emil-design-eng/SKILL.md`. Skim `.agents/skills/animation-vocabulary/SKILL.md`. Where these conflict with this doc, this doc wins.

**Reuse:**
- `src/components/shared/ui/*` and `src/data/demo.ts`. Never break their existing props, because V1 and V2 use them.
- V2's `Section.astro`, `Button.astro` and `v2.css` (for Geist and the hairline column).

## Three kinds of motion (mix them; each section uses the one that fits)
- **Scrubbed:** tied to scroll position, and it reverses exactly when you scroll back. Use ScrollTrigger with `scrub` (about 0.6–1 for smoothing). It is used by:
  - the hero reassembly;
  - the Results zoom;
  - the Interview zoom-out;
  - the How it works horizontal track;
  - section-heading depth parallax.
- **Triggered:** plays once on entry. Used for section reveals, bento tile entrances and the FAQ.
- **Interactive:** driven by the user. Covers:
  - the cursor pill;
  - magnetic primary buttons;
  - cursor tilt;
  - toggles, drag, the cheat detection, and the bento interactions.

**Pins** only from 768px. Below that, a scrubbed sequence plays as the section passes, without a pin, or simplifies.

**Physics** follow apple-design: springs and momentum (GSAP `Draggable` plus `InertiaPlugin`, both free in the `gsap` package), rubber-banding at the bounds, and interruptible animations.

## Global interaction layer (owner: agent A)
- **Contextual cursor pill:**
  - It shows only when `(pointer: fine)`, and the native cursor stays.
  - It follows with a slight lag (`gsap.quickTo`). Over any `[data-cursor="Label"]` element it shows the label ("Drag", "Try it", "Toggle", "Copy").
  - It is off for touch and for reduced motion.
- **Magnetic buttons:** primary buttons pull up to 6px toward the cursor.
- **Cursor tilt:** `[data-tilt]` frames tilt up to 6° toward the cursor, and children with `[data-depth="n"]` parallax in Z.
- **Scroll depth:** `[data-speed]` elements drift at their own speed (scrubbed).

## Sections and owners
Copy lives in `src/content/v3.ts` (agent A). It imports V2 strings where they're the same. The labs keep their own copy files.

1. **Nav (A):** same as V2.
2. **Hero (A):**
   - **Text:** the H1 "Hire the person, not the pile." and V2's sub-line, plus a link "Try the AI interview" with ↓, pointing to `#interview-lab`. No form.
   - **The exploded product view:** below the text, the CandidateReview screen split into 4–6 depth layers (the app frame, the applicant list, the profile card, the score ring, the integrity chip). Six to eight evidence chips float at different depths around it: "Matched: Node.js", "Missing: Kubernetes", "Job Fit 92", "Focus lost 0:42", "AI Interview 88", "Moved by Priya".
   - **The cursor parallaxes** every layer and chip by depth.
   - **Scrolled:** the layers converge and the chips dock into their places in the flat screen. Scrolling back explodes it again.
   - **Background:** the gradient horizon, once, behind the shot.
   - **Touch:** gentle idle drift, and the scrub still works.
3. **Results (A):**
   - **Title:** "From 1,200+ applicants to 4 hires."
   - **Pinned scrubbed canvas:** 1,200 dots, one per applicant.
     - **Phase 1:** 600 fade back, captioned "Screened against the job's requirements."
     - **Phase 2:** zoom into the 600, captioned "Took the AI interview."
     - **Phase 3:** 12 turn violet, and the zoom continues ("Shortlisted after the AI interview").
     - **Phase 4:** the 12 become initials avatars and 4 get "Hired" badges ("Hired after in-person interviews").
   - **Counters** scrub with the phases.
   - **Hover:** on the dots it shows an illustrative tooltip ("Applicant · Job Fit 41 · Missing: Node.js").
   - **The caption** "One real hiring round for engineering roles, run on Novara." stays visible.
   - **Reduced motion and no JS** show V2's annotated funnel list.
4. **Screen: `ScreeningLab` (agent C), `#screen`:**
   - **Title:** "Every resume, read against the job." **Sub:** "Toggle what the job needs and watch the ranking change."
   - **Requirement chips** (toggle buttons with `aria-pressed`): Node.js, TypeScript, PostgreSQL, API design, Kubernetes, Remote-friendly time zone.
   - **Six applicant rows** with a Job Fit Score each, computed deterministically from per-candidate matched and missing data.
     - Toggling a chip recomputes the scores (the numbers roll) and re-sorts with GSAP `Flip`.
     - Clicking a row expands its matched and missing items and its one-line reason.
   - **A "New applications" tray** with two resume cards. Drag one onto the job, or press its "Screen" button: its score ring fills and it slots into the ranking.
   - **A scrubbed intro:** the resume cards fan out of a stack as the section scrolls in.
   - **Note:** "Scores in this demo are illustrative."
5. **Interview: `InterviewLab` (agent B), `#interview-lab`, the centrepiece:**
   - **Scrubbed pinned intro:** it starts zoomed into the AI interviewer tile filling the viewport, with captions typing "Hi, I'm Novara's AI interviewer…". Scrolling zooms out to the full interview UI with its integrity panel, and then the demo goes live.
   - **Title:** "Try to cheat. Novara will notice."
   - **Sub:** "A live demo of the checks Novara runs during a real interview. Switch tabs, click away, copy the question or look away, and watch your report fill in. Nothing you do here is recorded or sent anywhere."
   - **Real detections while the demo is live:**
     - **Tab switched:** `visibilitychange`, logging the time away.
     - **Focus lost:** window `blur`/`focus`, logging the duration.
     - **Copied the question:** `copy` inside the lab.
     - **Pasted into the answer:** `paste` in the answer box.
     - **Left full screen:** a "Full screen" button using the Fullscreen API on the lab; exiting is flagged.
     - **Looking away:** the pointer leaves the interview frame for more than 2s. Desktop only, labelled "In this demo your cursor stands in for your eyes".
     - **"Simulate: camera off" and "Simulate: second face"** toggles. The page never touches the camera. They show an overlay on the interviewer and self-view tiles, and their events are tagged "simulated".
   - **Each event:**
     - the matching counter flips;
     - a timeline row appears with an mm:ss timestamp from the demo's start;
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
6. **Decide (A):**
   - **Title:** "You decide who moves on. Novara shows you why." **Sub:** "Drag Amara to your HR round. That call is yours."
   - **The drag:** drag her card (Draggable with inertia, snapping to columns, rubber-banding) from Completed to HR Round. On the drop, a "Moved on by you" stamp lands with a spring.
   - **Alternatives:** a keyboard and touch button, "Move to HR Round".
   - **Evidence panel:** hovering or focusing a card zooms in its evidence (the ScoreTriplet).
7. **How it works (A):** a pinned horizontal scrubbed track of V2's four steps. Each step's vignette animates in proportion to scroll; for example, the job description lines write in as you scroll. On mobile it is a vertical list with the same vignettes, played on entry.
8. **Platform (A):** V2's six-tile bento with cursor tilt, and **every tile genuinely interactive**:
   - **Scheduling:** click slots and get a booked toast.
   - **Career page:** "Copy embed code" copies the elided snippet for real, then shows "Copied".
   - **Roles:** permission toggles.
   - **Email templates:** a "Candidate name" input fills `{{candidate_name}}` in the preview as you type.
   - **Analytics:** a tab switch, and values on hover.
   - **Pipeline:** cards lift on hover.
9. **FAQ, close, footer (A):** as V2. The close keeps DemoForm with a magnetic submit button.

## Budgets and rules
- **Performance:**
  - Canvas DPR is capped at 2.
  - Pause the canvases and loops off screen (IntersectionObserver).
  - Animate only transform and opacity (canvas and SVG strokes are fine).
  - V3 page JS stays at or under about 150KB gzipped.
  - Pick no new libraries beyond `gsap` and its plugins.
- **Accessibility and input:**
  - Every interaction works by keyboard and touch.
  - Reduced motion: no parallax, tilt, follow, scrub or pins, but every interaction still works with instant state changes.
  - With no JS, all content is readable.
- **Truth:** PRODUCT.md claims only. Demo data is labelled illustrative. Palette tokens only. No glows behind text. No invented logos or stats.
- **SEO:** `noindex` for now. One H1, H2 per section, `<figure>` around mockups.

## Ownership (parallel build; respect it)
- **Agent A, in the main repo:**
  - owns `src/pages/v3/**`, `src/components/v3/**` (except `labs/**`) and `src/content/v3.ts`;
  - creates two **stubs**, `src/components/v3/labs/ScreeningLab.astro` and `InterviewLab.astro`. Each is a plain `<section>` with the right id, its H2 and its sub-line, and accepts a `tone` prop. Don't edit them past the stub.
- **Agent B, in a worktree:**
  - owns `src/components/v3/labs/InterviewLab.astro`, `src/components/v3/labs/interview/**`, and a test page `src/pages/lab-interview.astro` (noindex).
- **Agent C, in a worktree:**
  - owns `src/components/v3/labs/ScreeningLab.astro`, `src/components/v3/labs/screening/**`, and `src/pages/lab-screening.astro` (noindex).
- **Lab contract** (for B and C):
  - Self-contained. Each lab has its own copy file and script in its folder.
  - It renders its own section through V2's `Section.astro` with a `tone` prop ('white' | 'plate').
  - It boots via `onReady` from `src/scripts/motion.ts`, scopes everything to its root, and cleans up.
  - It uses `data-cursor` labels.
  - Its test page imports `src/components/v2/v2.css`.
- **Everyone:** `pnpm check` and `pnpm build` must pass, with /v1, /v2 and /lab still building. Run `.claude/skills/impeccable/scripts/impeccable detect --json` on your own files. No browser automation, no screenshots.
