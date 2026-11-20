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
  /** Single post (/blog/[slug]). Layout per "Novara pages layout single blog post" (docx). */
  post: {
    crumbs: { home: 'Home', blog: 'Blog' },
    meta: { writtenBy: 'Written by', published: 'Published on', updated: 'Updated on', readTime: 'Time to read', minutes: 'min' },
    share: { label: 'Share', linkedin: 'Share on LinkedIn', x: 'Share on X', facebook: 'Share on Facebook', copy: 'Copy link', copied: 'Copied' },
    toc: 'Table of contents',
    tableHint: 'Swipe the table to see all columns →',
    cta: {
      title: 'Recruitment Trends Report',
      line: 'Read the latest data, trends and insights shaping today’s hiring market.',
      form: { label: 'Work email', placeholder: 'Enter your email', submit: 'Get started', success: 'Thanks. The report is on its way.', fallback: 'The report opens soon. Please check back.' },
    },
    related: { title: 'Blogs you may love', line: 'More guides on screening, interviews and hiring with AI.', previous: 'Previous posts', next: 'Next posts', slide: 'Go to slide' },
    pending: 'The full article is on its way. Subscribe to get it when it is published.',
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
