import { withDefaultPopulate } from '../../../lib/populate';

/** `GET /api/home` returns every section without a populate query. A caller-supplied populate wins. */
export default withDefaultPopulate({
  seo: { populate: ['ogImage'] },
  nav: true,
  hero: true,
  results: true,
  testimonials: true,
  decide: true,
  how: { populate: ['steps'] },
  platform: { populate: [
      'dashboard',
      'jobs',
      'candidate',
      'pipeline',
      'scheduling',
      'interviews',
      'career',
      'analytics',
    ] },
  faq: { populate: ['items'] },
  close: true,
  footer: true,
});
