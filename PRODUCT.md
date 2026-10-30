# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 (static output), Tailwind CSS 4 and GSAP with Lenis. The user chose Astro for SEO. The deploy target is undecided. Marketing may later want to edit copy in WordPress, so page copy lives in data files, not inside components. Details are in `docs/implementation/00-foundation.md`.

## Users

The primary users are hiring teams (HR managers, recruiters and company admins) at companies that run high-volume hiring, such as engineering rounds with hundreds to thousands of applicants. Their job is to get from a flood of applicants to the few people worth meeting in person without running hundreds of first-round calls themselves. Landing-page visitors are evaluating a platform, and the page's job is to get a demo request. Candidates are not the audience.

Market: global, in English.

## Product Purpose

Novara is an AI-powered applicant tracking and recruitment platform. It covers:
- posting jobs with an AI-drafted description;
- parsing every resume and scoring it against the job;
- running the first-round interview with an AI interviewer;
- watching that interview for cheating;
- scoring every answer and the whole interview;
- carrying candidates through scheduling and the pipeline to the HR round and the offer.

Success means the hiring team spends its time only on the shortlist.

## Positioning

"You decide who moves on. Novara shows you why." Novara gives evidence, not verdicts. Every score shows its reasons: criteria matched and missing, question-level scores, the recording, and integrity events. The hiring team makes every move. The AI first round runs inside the applicant tracker's pipeline; it is not a separate tool bolted on.

Brand line: "Hire the person, not the pile."

## Operating Context

- Pipeline stages: Applied, AI Request, Prescheduled, Scheduled, Completed, HR Round, then Offered or Rejected.
- Team roles: Admin, HR Manager, Recruiter, with role-based access per module. Invitations expire after 7 days and can be resent.
- Candidates find jobs on a branded career page (embeddable on the company's own site) or via a shared link. They sign up, upload a resume, pick an interview slot from the ones recruiters set (they can reschedule, and the old booking stays on record), then take the AI interview.
- An inactive job blocks new applicants, but anyone mid-interview can still finish.
- Data and storage are isolated per company.

## Capabilities and Constraints

**Available:**
- authentication;
- company, user and role management;
- job management and activation;
- AI job descriptions;
- resume upload, parsing and matching;
- Job Fit Score: overall score, matching and missing criteria, AI reasoning;
- candidate application and dashboard;
- candidate management;
- AI interview: AI-generated and recruiter-added questions, AI-generated multiple choice;
- evaluation and scoring: rubric, question-level and overall AI Interview Score, report;
- interview scheduling;
- anti-cheat monitoring: tab switching, full-screen exit, copy/paste, camera status, multiple faces, looking away, focus;
- recording and results;
- interview dashboard;
- analytics (hiring trends, Job Fit Score and interview analytics; not in the PM list but shown in `design/reference/analytics.png`);
- pipeline and Kanban;
- career page with embed code;
- job sharing;
- email templates: editable, with variables, and you can restore the default;
- admin panel;
- multi-tenant data and per-company storage.

**In progress** (at most "coming soon"):
- recruiter-written multiple-choice questions;
- scenario and case questions;
- image-based questions;
- using your own AI provider.

**Not available:** subscriptions and billing. So there is no self-serve signup and no pricing; the call to action is "Request a demo".

**Roadmap, never claim:**
- posting to external job boards;
- CSV and bulk import;
- advanced AI search, tags and mentions;
- GDPR/CCPA reporting tools;
- CV claim verification and evidence-based reassessment;
- multi-turn case simulation;
- Workday, Wix and WordPress integrations.

**Stated by the user (2026-10-16), PM to confirm:** the AI interview is spoken, and candidate answers are transcribed. The home page demo shows the transcription.

**Unconfirmed by the PM, don't claim:**
- that Novara moves candidates between stages automatically, or applies score thresholds;
- offer letters or e-signing. "Offered" is the last stage.

**Terminology:**
- "Job Fit Score" (resume vs job) and "AI Interview Score" (the interview) are two separate scores. Never merge them.
- Integrity flags are events for a human to review, not verdicts.

## Brand Commitments

- **Name and maker:** the name is Novara. It is a product of Vivasoft (https://vivasoftltd.com/products/), and the official site is https://novara.my.
- **Logos:** the real files are in `public/brand/`: the hand-drawn "n" mark, the wordmark, and the Vivasoft logo. Never invent logos.
- **Palette:** the product design system's palette is binding: Untitled UI grays, primary #7237FB and the brand gradient #8C75FB→#421DF8.
- **Voice:** concrete, plain and short, in sentence case.
- **Lines the user chose:** "Hire the person, not the pile." and "You decide who moves on. Novara shows you why."
- **Standing preference: the demos are interactive (2026-10-30, DM team, reversing their 2026-10-29 request for animations only).** Visitors can drag, toggle, hover and try the demos (including trying to cheat the AI interview). The animation-only variant is kept on the `animated-only` branch.
- **Standing preference: a standard landing page.** It should plainly convey the product, with no narrative, metaphor or "out of this world" concepts (2026-10-16). The craft bar sits between Linear and Stripe, with Attio's look: light, every section visually distinct, and product UI that comes alive on scroll. Not Ashby.

## Evidence on Hand

**One real hiring round** for engineering roles. It may be published only anonymised, as "one real hiring round", with no company or event name:
1. Around 1,200 applied.
2. Novara's screening shortlisted 600, against the job's requirements, including country of application.
3. All 600 took the AI interview.
4. 12 were shortlisted after it.
5. 4 were hired after in-person interviews.

Caveats:
- "Around 1,200" is approximate, so present it as "1,200+" or "about 1,200", never as an exact count.
- The duration is unknown, so state no timeframe or time saved.

**Other sources:**
- product screens in `design/reference/*.png`;
- the PM's feature status list, `docs/novara-current-feature-overview.pdf`;
- the user flow, `docs/novara-user-flow.txt`.

**Absent, never fabricate:**
- customer names, logos, quotes or testimonials;
- ratings;
- certifications or compliance audits;
- time-saved percentages;
- pricing;
- footage of the AI interviewer avatar. Use a neutral stand-in, never a stock or AI-generated face.

## Product Principles

1. **Show the evidence, not the verdict.** Every number on the page carries its reason.
2. **People decide; Novara reads and runs the first round.** Never imply the AI hires.
3. **Claim only what ships.** Available features, plus the one real hiring round.
4. **Built for volume.** The first round scales to every qualified applicant (600 AI interviews in one round), so the team meets only the shortlist.

## Accessibility & Inclusion

The default target is WCAG 2.2 AA. This is a project default; the user didn't specify it. Every scroll animation has a reduced-motion version that shows its static end state, and all content is readable without JavaScript.
