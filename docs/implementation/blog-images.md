# Blog images: sizes for the marketing team

Source of truth in code: `IMAGE_SPECS` in `src/lib/blog.ts`. Every image needs alt text.

| Image | Where it shows | Shape | Minimum | Maximum | Format and weight |
|---|---|---|---|---|---|
| Feature (hero) image | Post header, right of the title (below it on tablet/phone); also the card thumbnail on /blog | 16:9 | 1600 × 900 px | 2400 × 1350 px | WebP or JPG, under 300 KB |
| Body image | Inside the article, full text-column width | 16:9 | 1600 × 900 px | 2400 × 1350 px | WebP or JPG, under 250 KB |
| Information image | Infographics, charts, diagrams inside the article | Full width, free height | 1600 px wide | 1600 × 2400 px | PNG or WebP, under 400 KB |

Notes

- The feature image is shown about 600–840 px wide on desktop, so 1600 px stays sharp on 2× screens.
- Keep text and logos inside the centre 80% of the feature image: cards crop it to 16:9 at smaller sizes.
- Text inside an information image must be at least 32 px at full size so it reads at about 16 px on screen.
- Until a post has real images, the site shows a neutral placeholder; in `pnpm dev` the placeholder prints the size above.
