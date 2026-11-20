/** Blog hub copy. Layout per "Novara pages layout blog page reference" (docx) and the Claude Design canvas. */

export const blog = {
  seo: {
    title: 'Recruitment Blog: Hiring Trends, AI Recruiting and HR Tips',
    description:
      'Get updated with the latest recruitment trends. Practical guides on AI recruiting, resume screening, interviews and candidate experience from the Novara team.',
  },
  hero: {
    eyebrow: 'Novara blog',
    title: 'Get updated with latest recruitment trends',
    line: 'Practical notes on hiring with AI: how to screen faster, interview fairly and shortlist with evidence. One short email when something new is out.',
    form: {
      label: 'Work email',
      placeholder: 'Enter your work email',
      submit: 'Subscribe',
      success: 'Thanks. You are on the list.',
      fallback: 'Subscriptions open soon. Please check back.',
    },
    note: 'We care about your data. Read our',
    privacy: { label: 'privacy policy', href: '/terms-policies' },
    shotCaption: 'Novara dashboard: open jobs, things to do, the jobs overview chart and recent activity.',
  },
  index: {
    title: 'Resources and insights',
    line: 'Guides, trends and playbooks for talent teams hiring with AI.',
    search: 'Search articles',
    sortLabel: 'Sort articles',
    sort: { latest: 'Latest', popular: 'Most read' },
    categoriesLabel: 'Blog categories',
    all: 'All categories',
    tagsLabel: 'Popular tags',
    tags: ['skills-based hiring', 'ATS', 'job description', 'interview rubric', 'time to hire', 'bias'],
    subscribe: { title: 'One email, every new article', line: 'No spam. Unsubscribe anytime.', cta: 'Subscribe', href: '#blog-subscribe-email' },
    featured: 'Featured',
    readMore: 'Read article',
    latest: 'Latest articles',
    popular: 'Most read articles',
    empty: { title: 'No articles match that search', line: 'Try another word or pick a different category.', reset: 'Clear filters' },
    pagination: { label: 'Pagination', previous: 'Previous', next: 'Next', page: 'Page' },
    pageSize: 6,
  },
  categories: ['Hiring strategy', 'AI in recruiting', 'Resume screening', 'Interviews', 'Candidate experience', 'HR operations'],
  close: {
    badge: 'Hire with evidence, not guesswork',
    title: 'Ready to Make Hiring Smarter?',
    line: 'See how Novara screens, interviews and ranks candidates for your next open role.',
    cta: { label: 'Hire the best team', href: '/contact' },
    /** Decorative product chips around the heading (hidden on phones). */
    chips: [
      { text: 'Interview scheduled · Tue 10:30', tone: 'warning' },
      { text: 'Offer accepted', tone: 'success' },
      { text: '1,200 resumes screened', tone: 'blue' },
    ],
    score: { value: '92', label: 'Job Fit Score', name: 'Amara Okafor' },
  },
} as const;
