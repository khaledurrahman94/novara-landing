# Launch checklist

Work through this before either variant goes live as `/`.

- [ ] **Demo form endpoint.** Pass `action` to DemoForm (V2) and to the V1 CTA form, using HubSpot, Formspree, the CRM or whatever marketing uses. Without it, production builds warn and send nothing.
- [ ] **Indexing.** Remove `noindex` from the winning page, and remove the sitemap filter in `astro.config.mjs`. `robots.txt` already links `/sitemap-index.xml`.
- [ ] **Social preview.** Add a 1200×630 PNG and pass it through Base's `image` prop. The default is an SVG, which LinkedIn, X and Facebook don't render.
- [ ] **AI interviewer media.** Replace InterviewFrame's neutral stand-in with a real still or clip of Novara's avatar.
- [ ] **Domain.** Confirm `site` in `astro.config.mjs` (currently `https://novara.my`). It drives the canonical URLs and OG links.
- [ ] **Log in link.** Add one if existing customers need it from the landing page; it's left out because the URL is unknown.
- [ ] **PM confirmations.** The page avoids these claims, so keep it that way until they're confirmed: automatic stage moves, score thresholds, offer letters.
