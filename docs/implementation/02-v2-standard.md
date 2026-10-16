# 02 V2: a standard landing page, at top craft

This is route `/v2`. It is a conventional B2B landing page with no metaphor or narrative.

**Craft bar:** between Linear and Stripe, with Attio's look: light, every section visually distinct, and product UI that comes alive on scroll. It must clearly differ from V1 (`/v1`) in structure, type and motion. Don't reuse V1's section layouts.

**Read first:**
- `PRODUCT.md`;
- `docs/implementation/00-foundation.md`;
- `.impeccable/surfaces/src-pages-v2-index-astro.md` (the direction contract, binding);
- `.claude/skills/impeccable/reference/craft-floor.md`, before your first UI edit.

**Reuse:** the shared product UI in `src/components/shared/ui/` and the data in `src/data/demo.ts`. Open `/lab` in the source to see them. You may add shared components, but never change existing props in ways that break V1.

## System
- **Type:** Geist (variable) for all marketing text, via Fontsource; check the package exists and add it. Inter stays inside product UI.
  - Display tracking is tight (about -0.03em); the H1 is about 72px on desktop.
  - Labels are Geist medium in text-tertiary. No mono labels.
- **Ground and structure:**
  - White page, with bg (#F9FAFB) used for product plates and alternating bands.
  - A centred column (max about 1200px), framed by two full-height 1px border-secondary hairlines.
  - Full-width hairlines between sections.
- **Colour:**
  - Violet primary only for buttons, links, focus states and data highlights.
  - The brand gradient exactly once, as a soft horizon behind the hero product shot (never behind text).
  - Status colours from tokens only.
- **Buttons:** primary is solid violet; secondary is white with a 1px border. Same radius family as the product UI.
- **Spacing:** generous between sections (about 128px desktop, 80px mobile) and dense inside the bento.

## Sections (exact copy; put it all in `src/content/v2.ts`)
1. **Nav** (sticky; it gains a white fill and a hairline when scrolled):
   - logo;
   - anchors: Product · How it works · Results · FAQ;
   - a "Request a demo" button that goes to the hero form (or the close form if the hero is out of view).
2. **Hero:**
   - **Eyebrow:** "AI resume screening and first-round interviews".
   - **H1:** "Hire the person, not the pile."
   - **Sub:** "Novara scores every resume against the job, runs the first round with an AI interviewer, and shows your team the evidence behind every shortlist."
   - **Inline form:** work email + "Request a demo". A shared `DemoForm` component with an `action` prop, client-side validation and a success state, and a TODO for the endpoint.
   - **Below:** a full-column **CandidateReview** app screen. It is a new shared component composed from the existing ones, with a slim app sidebar like the real product:
     - a left applicant list (ranked);
     - on the right, Amara's profile with Job Fit 92 and its reasons, AI Interview 88, integrity "1 event to review", and a "Move to HR Round" button.
3. **Results** `#results`:
   - **Eyebrow:** Results. **Title:** "From 1,200+ applicants to 4 hires."
   - **The four figures:** 1,200+ applied, 600 took the AI interview, 12 shortlisted, 4 hired. Show them as a horizontal funnel whose bar lengths are proportional; the tiny final bars are the point.
   - **Caption:** "One real hiring round for engineering roles, run on Novara."
4. **Product** `#product`. Three feature sections, each with a different layout (not mirrored copies):
   - **Screen:**
     - **Title:** "Every resume, read against the job."
     - **Line:** "Novara parses each resume and gives it a Job Fit Score: what matches, what's missing, and why."
     - **Visual:** JobFitCard with a ranked ApplicantList.
   - **Interview:**
     - **Title:** "First-round interviews, without the calendar."
     - **Line:** "Candidates pick a slot and take a structured interview with Novara's AI interviewer. Integrity checks flag moments for your review."
     - **Visual:** InterviewFrame with IntegrityPanel.
   - **Decide:**
     - **Title:** "You decide who moves on. Novara shows you why."
     - **Line:** "Every answer scored, every flag timestamped, the recording a click away. Move the right people to your HR round."
     - **Visual:** InterviewScore, ScoreTriplet, and a pipeline card moving from Completed to HR Round with "Moved by Priya".
5. **How it works** `#how`. Four numbered steps in a row (stacked on mobile), each with a small UI vignette:
   1. **Post the job:** "Novara drafts the description from the role, level and skills."
   2. **Candidates apply:** "From your branded career page or a shared link."
   3. **Screen and interview:** "A Job Fit Score for every resume, and AI first rounds for the candidates you invite."
   4. **You decide:** "Review the evidence and move people to your HR round."
6. **Platform** bento. **Title:** "Everything between apply and offer." Six tiles of varied sizes, each with one distinct micro-interaction:
   - **Pipeline board:** the real stage names.
   - **Interview scheduling:** recruiters set the slots; a reschedule keeps the old booking on record.
   - **Career page:** branded, with embed code, reusing CareerPage.
   - **Roles and permissions:** Admin, HR Manager, Recruiter.
   - **Email templates:** variables, plus restore default.
   - **Analytics:** candidates by stage.
7. **FAQ** `#faq`:
   - Native `<details>` elements, with FAQPage JSON-LD.
   - Questions and answers, which must stay true to PRODUCT.md:
     - **"Does Novara decide who gets hired?"** "No. Novara scores resumes and interviews and shows its reasons. Your team decides who moves on, who gets an HR round and who gets an offer."
     - **"What is the AI interview like for candidates?"** "Candidates pick a time slot, then talk with Novara's AI interviewer. Questions are written for the role by Novara, alongside any your team adds."
     - **"How does Novara handle cheating?"** "During the interview, Novara watches for tab switching, leaving full screen, copy and paste, the camera turning off, more than one face, and looking away. Each event is timestamped in the report for your team to review."
     - **"Can we add our own interview questions?"** "Yes. Add your own questions alongside the ones Novara writes for the role."
     - **"Can candidates reschedule?"** "Yes. They pick a new slot from the times your team sets, and the original booking stays on record."
     - **"Can we list jobs on our own website?"** "Yes. Novara gives you a branded career page with embed code for your site, plus a shareable link for every job."
     - **"Who on our team can use it?"** "Admins, HR managers and recruiters, each with role-based access. Invite teammates by email."
     - **"Is our data kept separate from other companies?"** "Yes. Each company's users, jobs, candidates, resumes, recordings and reports are isolated, with separate storage per company."
8. **Close:**
   - **Title:** "Meet only the people worth meeting."
   - **Line:** "Request a demo to see Novara screen, interview and explain."
   - **Form:** DemoForm.
9. **Footer:**
   - logo, and the line "Resume screening, AI interviews and your hiring pipeline in one platform.";
   - the anchors;
   - "A product of Vivasoft", linking to https://vivasoftltd.com/products/;
   - © 2026 Novara;
   - the footnote: "Names and profiles in product views are illustrative. Results figures are from one real hiring round for engineering roles."
   - No dead links.

**SEO:**
- **Title:** "Novara: AI resume screening and AI interviews for hiring teams".
- **Description:** at most 155 characters.
- **Headings:** one H1, with every section's title an H2.
- **Mockups:** wrapped in `<figure>`, with real text in them.
- **Schema:** FAQPage JSON-LD.
- **Indexing:** keep `noindex` for now.

## Motion (one grammar; in-flow only, with no pinning and no scroll-jacking beyond Lenis)
- **Hero:**
  - H1 words rise from a mask (stagger about 40ms), then the sub-line and form fade in.
  - The product shot enters tilted (rotateX about 10°, slight scale) and flattens to 0° as it scrolls through the viewport, scrubbed.
  - When it settles, its panels come alive once: the score counts 0→92, the criteria tick, and the integrity event appears.
- **Results:** the bars grow to their proportional lengths in sequence as the numbers count. This plays once on entry.
- **Each feature section has one distinct product moment,** triggered once at about 65% of the viewport:
  - **Screen:** criteria check off and the ranked list sorts.
  - **Interview:** captions type and timeline events tick.
  - **Decide:** the pipeline card slides into HR Round and the "Moved by Priya" stamp appears.
- **How it works:** steps reveal left to right with a connecting line drawing.
- **Bento:** each tile animates its own micro-interaction on hover or focus (desktop) and once in view (touch). For example, a slot gets selected, the embed code gets copied, a role toggle flips, a template variable fills in, a bar grows.
- **FAQ:** smooth open and close of `<details>`, with a reduced-motion fallback.
- **Mechanics:** transform and opacity only (an SVG stroke is fine); tokens for duration and easing; reduced motion shows every end state; with no JS, everything is visible.

## Boundaries and done
- **You own:** `src/components/v2/**`, `src/content/v2.ts`, `src/pages/v2/**`, and additions in `src/components/shared/**` and `src/data/demo.ts`.
- **Dependencies:** report any new one.
- **No browser automation and no screenshots.** The user reviews the visuals in `pnpm dev`.
- **Verify:** `pnpm check` and `pnpm build` must pass. Run `.claude/skills/impeccable/scripts/impeccable detect --json src/components src/pages` once at the end: fix what's mechanical and list the rest.
- **Don't commit.**
