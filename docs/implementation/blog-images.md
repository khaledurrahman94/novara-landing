# Blog images: sizes for the designer and marketing team

Source of truth in code: `IMAGE_SPECS` in `src/lib/blog.ts`. One standard for every blog image, matching the
Vivasoft blog (their feature and infographic originals are 1920 × 1080).

| Image | Size | Ratio | Where it shows | Format | Max file size | Notes |
|---|---|---|---|---|---|---|
| Feature (hero) image, one per post | 1920 × 1080 px | 16:9 | Beside the post title; also the /blog card thumbnail and the social share image | WebP (JPG fallback) | 300 KB | Title, logo and key content inside the centre 80% (about 1536 × 864 px) |
| Body image (photo, screenshot, illustration) | 1920 × 1080 px | 16:9 | Inside the article, full text-column width | WebP (JPG fallback) | 300 KB | Key content inside the centre 80% |
| Information image (infographic, chart, diagram) | 1920 × 1080 px | 16:9 | Inside the article, full text-column width | WebP or PNG | 400 KB | Text inside the image at least 32 px so it reads on phones |

For every image

- Novara palette: violet #7237FB, light violet #F5F1FF, the gray scale and white. Product UI over stock photos.
- File names in lowercase with hyphens, named after the post, e.g. `what-is-recruitment-software-hero.webp`.
- Send a one-line description with each image; it becomes the alt text.
- Until a post has real images, the site shows a neutral placeholder; in `pnpm dev` the placeholder prints the size.
