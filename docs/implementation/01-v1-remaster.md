# 01 V1: remaster of the agency landing

Route `/v1`. This is a **refinement**. Keep the agency page's look and fix its faults; don't invent a new visual world.

Read before building:
- `PRODUCT.md`: product truth, what may be claimed, the real hiring round.
- `docs/implementation/00-foundation.md`: stack, tokens, motion and SEO conventions.
- `.claude/skills/impeccable/reference/craft-floor.md`: the quality floor. Read it before your first UI edit.

Visual source:
- `design/reference/novara-landing-latest.png` (2880×21885 at 2x). View crops with PIL; never load it whole.
- `design/reference/novara-landing-latest-ai-hiring-process.png`.
- Product UI language: `design/reference/novara-candidate-screen.png`, `novara-dashboard.png`, `interviews.png`, `novara-authenticity-checker.png`, `career-page-setup-1.png`.

## Keep (the incumbent identity)
- **Type and mood:** Urbanist for marketing type; a light, airy page; primary violet as the accent.
- **Section headers:** an eyebrow pill (rounded-full, 1px border, dot) above each section title, then the title on the left with a short line on the right. Use this pattern at most 3 times and vary the rest.
- **The hero headline:** three lines, the third in `primary`, at the agency's scale.
- **Product mockups:** white UI panels on a `bg-tertiary` plate inside a 1px `border-secondary` frame, as in "The Platform" section.
- **The footer wordmark:** the giant "Novara" with a downward fade.

## Fix (non-negotiable)
1. **One ground.** The page alternates only `bg` and `bg-secondary`. Delete all of these: lavender or pink blob gradients, the pink grid, the plum and navy sections, the warm beige footer. Dark appears only *inside* product UI (the interview video frame). The brand gradient appears once, on the CTA band.
2. **Palette only.** Status colours are `success`, `warning`, `blue-light` and `primary`, plus their tints. No other hues anywhere.
3. **Ten sections become six** (listed below). Delete these:
   - the "Novara Advantage" dashed icons;
   - the "Why Novara" six cards;
   - the 1–6 coloured staircase;
   - all stock photos;
   - the Figma-style cursor avatars.
4. **Score truth.**
   - The Job Fit Score (resume vs job) shows its matched and missing criteria plus the reasoning.
   - Interview metrics appear only under the AI Interview Score.
   - No nested arcs, and no chart where size disagrees with value.
   - One consistent demo cast. No name may appear in two conflicting states.
5. **Claims.** None of these may appear:
   - "Get started" or self-serve signup;
   - "moves candidates automatically";
   - "signed offer";
   - a "Candidates" solution;
   - invented stats or logos;
   - talent search (roadmap only).
6. **Rhythm.** One spacing scale, more space above a heading than below it, no half-empty columns, no cramped clusters.

## Data and copy
- `src/data/demo.ts` (shared with V2):
  - **Role:** Backend Engineer (Node.js), Remote.
  - **Lead candidate:** Amara Okafor. Job Fit 92. Matched: 6 yrs Node.js and TypeScript, PostgreSQL at scale, led an API migration. Missing: Kubernetes (nice to have). AI Interview 88, with three question-level scores (Technical depth 9/10, Problem solving 8/10, Communication 9/10). Integrity: 1 event to review (focus lost for 3s at 10:42).
  - **Others:** Leo Park 81 (AI Request), Nadia Rahman 58 (not a fit: missing 3 required skills), Marcus Webb 76 (Scheduled), Ines Duarte 84 (Completed), Kenji Sato 79 (HR Round).
  - **Recruiter:** Priya Nair.
  - **Real round:** `{ applied: '1,200+', interviewed: 600, shortlisted: 12, hired: 4 }`.
- `src/content/v1.ts`: every visible V1 string. No copy hardcoded in components; marketing may port it to a CMS later.
- A small footnote near the footer: "Names and profiles in product views are illustrative. Hiring-round figures are from one real hiring round for engineering roles."

## Shared product UI (`src/components/shared/ui/`, Inter, built so V2 can reuse them)
`JobDraft`, `JobFitCard`, `ApplicantList` (ranked), `InterviewFrame`, `IntegrityPanel`, `InterviewScore`, `PipelineBoard`, `SlotPicker` (with toast), `CareerPage` (job list plus "Embed on your site" code line), `StageChart`, `ScoreTriplet`.

Rules for every component:
- **Data:** it takes data as props from `demo.ts`.
- **Static render:** fully server-rendered and readable without JS.
- **Hooks:** it exposes `data-anim` hooks for its animation targets and contains no scroll logic.
- **Fidelity:** it matches the real app's language (Untitled UI-style cards, 12–14px UI text, real stage names). It should be crisper than the screenshots, but recognisably Novara.

The InterviewFrame is a neutral stand-in, because no AI interviewer avatar media exists:
- a dark video tile with a soft violet-tinted field;
- a voice waveform while it speaks;
- the label "Novara interviewer";
- live captions;
- a REC chip and a timer;
- a candidate self-view tile with initials.

No faces, no stock photos, no AI-generated people.

Add `src/pages/lab.astro` (noindex), showing every component in each state.

## Sections (copy is exact unless marked)
1. **Header** (sticky; gets a `bg-secondary` fill and a bottom border once scrolled):
   - Novara logo (`/brand/novara-full.svg`);
   - anchors: How it works · Job Fit · AI interview · Platform;
   - right: a "Request a demo" button that scrolls to the CTA form.
   - No login link (no URL is known), no menus.
2. **Hero:**
   - **H1:** "Screen every resume." / "Interview every candidate." / "Hire the person, not the pile." (the last line in primary).
   - **Sub:** "Novara scores every resume against the job, runs the first-round interview with an AI interviewer, and shows your team the evidence behind every shortlist."
   - **Buttons:** Request a demo (primary) · See how it works (secondary, goes to #how).
   - **Stat row** (the agency's layout): **1,200+** applied · **600** AI interviews · **4** hired, with the caption "One real hiring round for engineering roles."
   - **Right side:** one coherent product composition (a JobFitCard ring at 92, an InterviewFrame tile, a pipeline chip, a job-post chip) in layered depth.
3. **How it works** `#how`:
   - **Eyebrow:** How it works. **Title:** "One hiring round, start to shortlist."
   - **Six steps,** each with one line, and each driving a mockup on the left:
     1. **Create the job:** "Novara drafts the description from the role, level and key skills. You edit and publish."
     2. **Screen resumes:** "Every resume is parsed and scored against the job."
     3. **Job Fit:** "See what matches, what's missing, and why."
     4. **AI interview:** "Candidates pick a slot and take the first round with Novara's AI interviewer."
     5. **Integrity:** "Tab switches, a second face, copy and paste: flagged with timestamps for your review."
     6. **You decide:** "Review the scores, the recording and the flags. Move the right people to your HR round."
4. **Job Fit** `#fit`:
   - **Title:** "You decide who moves on. Novara shows you why."
   - **Left:** the agency's big score (92 counting up), the name and role, and a Qualified chip.
   - **Right:** JobFitCard: matched criteria (success), missing (warning), and a "Why Novara ranks Amara here" reasoning paragraph.
   - **Below:** ApplicantList with three ranked rows. It replaces both the nested arcs and the three duplicate stage cards.
5. **AI interview** `#interview` (a light section):
   - **Title:** "Meet your AI interviewer. Review every answer."
   - **Line:** "Structured first rounds candidates can take any time. Integrity checks run alongside and flag moments for you to review."
   - **Content:** InterviewFrame (dark inside), IntegrityPanel (counters plus a timestamped timeline plus "1 event to review"), InterviewScore.
6. **Platform** `#platform`:
   - **Title:** "Everything between apply and hired."
   - **Tabs:** Pipeline, Scheduling, Career page, Evaluation, Analytics. Each has a one-line heading and a sentence (write them in the agency's tone, true to PRODUCT.md).
   - **Pipeline:** the PipelineBoard card's status reads "Moved to HR Round by Priya".
   - **Analytics:** StageChart over the real round (1,200+ / 600 / 12 / 4), with bar heights proportional (the tiny bars are the point) and labels.
7. **CTA band** (brand gradient, once):
   - **Title:** "Your next shortlist starts here."
   - **Line:** "See how Novara screens, interviews and explains, from job post to HR round."
   - **A working form:** work email plus "Request a demo". It has an `action` prop (no backend yet: client-side validation and a success state; leave a TODO for the endpoint).
8. **Footer** (`bg-secondary`):
   - the logo, and the line "Resume screening, AI interviews and your hiring pipeline in one platform.";
   - the anchor list;
   - "A product of Vivasoft" linked to https://vivasoftltd.com/products/;
   - © 2026 Novara;
   - the illustrative footnote;
   - the giant wordmark.
   - No dead links and no social icons (no URLs are known).

SEO:
- **Title:** "Novara | AI resume screening and AI interviews for hiring teams".
- **Description** (≤155 chars) on the same lines.
- Exactly one H1, sections as H2.
- Semantic lists and `<figure>` around the mockups, with real text in the mockups (no images of text).

## Motion (GSAP + ScrollTrigger via `motion.ts`; transform and opacity only; tokens for timing)
- **Hero:**
  - The H1 lines rise from a mask (SplitText lines, 80ms stagger).
  - The composition layers enter with depth.
  - Pointer parallax on desktop (±8px max).
  - Scroll parallax: the layers drift at 3 speeds as the hero leaves.
  - The stats count up once.
- **How it works:**
  - At ≥1024px it is pinned: scroll scrubs through the 6 steps, the active step fills, and the mockup crossfades. The step list is also clickable.
  - Below 1024px: stacked steps, each with its mockup revealed on entry. No pin.
- **Job Fit:** the score counts 0→92; the criteria rows stagger in; the reasoning fades in line by line.
- **Interview:**
  - The captions type in.
  - Timeline events appear in order with scroll.
  - The focus-loss counter flips 0→1 when its event appears.
  - The waveform moves only while it is on screen.
- **Platform:**
  - Pinned tab scroller at ≥1024px (also clickable).
  - A segmented control on mobile, with no pin.
  - The StageChart bars grow to their proportional heights.
- **Mockup frames:** subtle depth inside them (the inner panel moves at about 0.9× the frame).
- **Footer:** the wordmark parallax.
- **Reduced motion:** every animation shows its end state with no pin. No-JS: all content is visible.
- **Keep motion lean:** no scroll-jacking beyond Lenis, no motion that doesn't explain something.

## Boundaries and done
- You own `src/components/v1/**`, `src/components/shared/**`, `src/data/**`, `src/content/v1.ts`, `src/pages/v1/**` and `src/pages/lab.astro`. Report any new dependency.
- No browser automation and no screenshots. Verify with `pnpm check`, `pnpm build`, and `.claude/skills/impeccable/scripts/impeccable detect --json src/components src/pages` once at the end; fix what's mechanical and list the rest.
- Don't commit.
