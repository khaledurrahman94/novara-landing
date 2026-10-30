# Company pages: /about, /contact, /pricing, /terms

Code-owned for now, no CMS wiring. Copy lives in `src/content/company.ts` (About, Contact, shared contact details) and `src/content/legal.ts` (the four legal documents as documents -> sections -> blocks). Pages: `src/pages/about.astro`, `contact.astro`, `terms.astro`, on the shared `src/layouts/Page.astro` (home Nav + Footer). They are registered in `src/lib/pages.ts` (`companyProvider`) so the sitemap and validation know them.

`/terms` holds Privacy Policy, Terms of Service, Terms and Conditions and Cookie Policy as sections with ids `privacy-policy`, `terms-of-service`, `terms-and-conditions`, `cookie-policy`. `/privacy` and `/cookies` redirect (301) to their sections.

## Draft cleanup
Removed as drafting notes: Privacy section 7 "Specific retention periods ... should be established and communicated where required."; Cookie Policy section 4 "A current cookie inventory should identify ..."; Cookie Policy section 3 "The actual categories used will depend on the technologies implemented by Novara." All square brackets stripped. `[Legal Entity Name]` -> "Novara"; Registered Address and Privacy Contact Email -> the Neu Suites address and dinno@novara.my.

## Still unknown (empty in `legal.ts`; nothing blank or bracketed ships)
- `legalEntity`: until set, "Novara" is used.
- `jurisdiction`: the Governing Law clause (Terms of Service s.15, Terms and Conditions s.14) renders only when set.
- Effective / last updated dates of Terms of Service and Terms and Conditions: the date lines render only when set (Privacy and Cookie: 29 October 2026).
- `/pricing` is a minimal placeholder (heading, one sentence, Request a demo and Contact us buttons; copy in `company.pricing`). Open item: the DM team still owes the pricing content (plans, prices, trial).
- Contact details (email, phone, address, website) come from novara.my, pending DM team confirmation.
- `/contact` has a message form (`src/components/shared/ContactForm.astro`: name, work email, optional company, message, hidden honeypot). Copy is in `company.contact.form`. Its endpoint is pending: with no `action` prop, dev shows success and production logs a warning and shows a fallback line. Pass `action` in `contact.astro` once the endpoint exists.

## Links to pages that are not built yet
These pages do not exist yet, so nothing links to them: /security, /resources, /ats, /ai-interview, /features, /solutions, /roi-calculator, /integrations.

How it works: every link in `src/content/home.ts` that the Nav, the Hero and the Footer render has a `live: boolean` (`nav.links[]`, `hero.pricing`, `footer.columns[].links[]`). The components render only `live: true` links:
- `Nav.astro` filters `nav.links`; with none live the link list is not rendered at all.
- `Hero.astro` renders "See pricing" (primary, only when `live`) and "Request a demo" (secondary, scrolls to the demo form; primary if pricing is hidden). The header (`Nav.astro`) has Sign in (secondary, hidden below lg) and Get started (primary) buttons and no demo button.
- `Footer.astro` filters each column's links and drops a column with no live link (the Product column is hidden today; Company shows Home, Contact us, About us, Pricing and Terms and policies, the PDF's "for now" list). There is no separate Terms link: it lives in the Company column.

The data stays in `home.ts` so enabling a page is a one-word change: when `/pricing` ships, add the page and set `live: true` on the entries (Pricing is now live). Register the new page in `src/lib/pages.ts` as for the pages above.

Guard: `homeProvider` in `src/lib/pages.ts` lists every `live` link on the home page record, so the existing `link-missing` check fails the build if a link is marked live for a path that is not a page on the site. External links (the sign-in URL) are not checked.
