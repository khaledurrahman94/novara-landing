# Company pages: /about, /contact, /terms

Code-owned for now, no CMS wiring. Copy lives in `src/content/company.ts` (About, Contact, shared contact details) and `src/content/legal.ts` (the four legal documents as documents -> sections -> blocks). Pages: `src/pages/about.astro`, `contact.astro`, `terms.astro`, on the shared `src/layouts/Page.astro` (home Nav + Footer). They are registered in `src/lib/pages.ts` (`companyProvider`) so the sitemap and validation know them.

`/terms` holds Privacy Policy, Terms of Service, Terms and Conditions and Cookie Policy as sections with ids `privacy-policy`, `terms-of-service`, `terms-and-conditions`, `cookie-policy`. `/privacy` and `/cookies` redirect (301) to their sections.

## Draft cleanup
Removed as drafting notes: Privacy section 7 "Specific retention periods ... should be established and communicated where required."; Cookie Policy section 4 "A current cookie inventory should identify ..."; Cookie Policy section 3 "The actual categories used will depend on the technologies implemented by Novara." All square brackets stripped. `[Legal Entity Name]` -> "Novara"; Registered Address and Privacy Contact Email -> the Neu Suites address and dinno@novara.my.

## Still unknown (empty in `legal.ts`; nothing blank or bracketed ships)
- `legalEntity`: until set, "Novara" is used.
- `jurisdiction`: the Governing Law clause (Terms of Service s.15, Terms and Conditions s.14) renders only when set.
- Effective / last updated dates of Terms of Service and Terms and Conditions: the date lines render only when set (Privacy and Cookie: 29 October 2026).
- Contact details (email, phone, address, website) come from novara.my, pending DM team confirmation.

## Not built yet (links still 404)
/pricing, /security, /resources, /ats, /ai-interview, /features, /solutions, /roi-calculator, /integrations.
