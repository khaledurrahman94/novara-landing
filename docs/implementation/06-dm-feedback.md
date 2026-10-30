# 06: DM team page feedback (2026-10-29)

Source: "Novara pages layout and content outline" from the DM team. Items marked NEW were highlighted yellow ("must add"); they allowed us to remove existing sections we disagree with. Section names below are the home page's (`src/components/home/`).

Rules that still apply: claim only features marked Available in `docs/novara-current-feature-overview.pdf`; no invented stats, customer names, logos or quotes; palette from `src/styles/tokens.css`; copy stays in `src/content/home.ts` (it seeds the CMS), structure stays in code.

## Header (Nav)
_Update (2026-10-29): links to unbuilt pages are not rendered. See `07-company-pages.md` (`live` flags in `home.ts`)._
- Now: Home, Sign in, Contact us, About us, Pricing, plus the Book a demo button.
- Later, when the pages exist (do not render yet, but keep the nav data shaped so they can be added): Platform (AI Interview, ATS), Features, Solutions, ROI Calculator, Pricing, Resources (Knowledge Hub), Sign in, Book Demo. References: manatal.com, recruitcrm.io.

## Hero
- NEW: an image on the right side of the h1 (the right half is empty today).
- NEW: after the description, two buttons: "See pricing" and "Sign in".
- Existing job-fit screenshot: use real Novara dashboard data where we have it (`design/reference/`); if the data already matches, leave it.

## Social proof (NEW)
- A trust section (customer logos and a count). We have no confirmed customers, logos or counts. Build it as a slot that renders only when real data is supplied; ship it empty. Do not invent "+30 companies".

## Results (existing)
- Use original Novara data. The 1,200 to 4 funnel is currently illustrative; keep the "illustrative" label unless real numbers are provided.

## Screening and Interview labs (existing)
- Use real candidate-evaluation data and scoring logic from the dashboard.
- Integrity monitoring needs clarification, especially the camera-related events (Camera off, Second face, Looking away). Use the real interview questions, features and monitoring data from the dashboard. Say plainly which signals are real detection and which are switches in the demo.

## How it works (existing, replace)
The 4 steps do not match the product. Replace with 9:
1. Create a Job
2. Publish the Job
3. Receive Applications
4. Analyze Resumes
5. Evaluate Job Fit Scores
6. Invite Candidates to AI Interviews
7. Generate Interview Evaluation
8. Shortlist and Manage Candidates
9. Make the Final Hiring Decision

## Platform (existing)
- Use the actual pipeline dashboard.
- Add a text box on the left of the H2 ("Everything between apply and offer.").

## Who it is for (NEW, before FAQ)
H2: "Recruitment Platform for Every Team, Role and Industry". Four groups, each with an icon, its own description, check-marked points and a button (reference: recruitcrm.io "Every recruiter places more", tabbed list on the left, detail card on the right):
- For Company: Small & Medium Businesses; Startups & Growing Companies; Enterprise Hiring; BPO
- By Role: HR Teams; Hiring Managers; IT; Finance
- Industry: Healthcare; Manufacturing; Insurance; Transportation; Accounting; Information Technology
- Recruitment & Staffing Agencies: In-House Recruitment; Corporate Recruiting; Executive Search Firms; Direct Hire Agencies; Consulting & Staffing Firms

Detail cards must not claim unconfirmed features or outcomes (no "3x more placements").

## FAQ (redesign)
Two-column: heading on the left, a bordered list of question rows on the right with a plus/chevron (reference: bullhorn.com).

## Close
Unchanged.

## Footer
- Brand column: logo and description; "Follow us" with LinkedIn, X, YouTube, Instagram icons; below it "A product of Vivasoft" (link: https://vivasoftltd.com/products/).
- Column 2: ATS, AI interview, Features, Solutions, ROI Calculator, Integration.
- Column 3: About us, Contact us, Pricing, Resources, Security.
- Last row: "Get an AI summary of Novara" with ChatGPT, Claude, Gemini, Grok icons (each opens that assistant with a prefilled prompt about novara.my); "© 2026 Novara. All rights reserved." and a Terms and policies link.
- Until the destination pages exist, link only to routes that exist and render the rest as plain unlinked text, or point them at the planned routes (`/about`, `/contact`, `/pricing`, `/terms`, `/security`) and list them in the report so none ships as a 404 unnoticed.

## Interactive or animated (decided twice)
- 2026-10-29: the DM team asked for animations only, so every demo became a self-playing animation (commits `1e96b17` to `62e8494`).
- 2026-10-30: the DM team changed their mind, and the demos are interactive again: the screening lab (requirement toggles, drag a resume into the ranking), the interview lab (live "try to cheat" detection and simulate switches), Decide (drag Amara), the Platform tiles, the Results tooltips and the cursor layer (pill, magnetic buttons, tilt, ghost pointer). Restored from the `interactive` branch, then merged by hand with everything that landed since (new Nav, Hero buttons, Footer, the AI interviewer avatar, the How it works and Audience snap, the `live` link guard, the removed Roles tile).
- The animation-only variant is kept on the `animated-only` branch (tip `d29f182`) in case it is wanted again.
- Not restored: the How it works snap is kept, so its step buttons scroll to the step's settled snap point instead of the old even spacing.

## 2026-10-30 follow-ups
- How it works: an `intro` paragraph sits right of the heading on md+ (stacked on mobile).
- Audience: an `intro` paragraph right of the heading, and a one-line `tagline` under each tab label (shown from lg, hidden in the mobile tab strip).
- Footer: the faded "Novara" wordmark is back below the bordered container; contact email, phone and address sit under the social icons (`footer.contact`).
- CMS fields added (all optional): `home.how.intro`, `home.audience.intro`, `home.audience-group.tagline`, `home.footer.email`, `phone`, `address`. Restart Strapi and re-seed to fill them.
