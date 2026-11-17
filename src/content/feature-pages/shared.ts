import type { Cta, Shot } from './types';

export const DEMO_HREF = '/contact';

export const featureCopy = {
  step: 'Step',
  sectionIds: {
    how: 'how-it-works',
    why: 'why-novara',
    faq: 'faq',
    close: 'book-demo',
  },
};

export const featureShot = (slug: string, name: string, alt: string, width: number, height: number): Shot => ({
  src: `/features/${slug}/${name}.webp`,
  alt,
  width,
  height,
});

export const demoAndExplore = (exploreHref: string): Cta[] => [
  { label: 'Book a Demo', href: DEMO_HREF },
  { label: 'Explore Features', href: exploreHref, variant: 'secondary' },
];
