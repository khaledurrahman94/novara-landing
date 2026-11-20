import type { BlogPost } from '../lib/blog';
import { blogArticles } from './blog-articles';

/**
 * PENDING CMS: placeholder posts until the Strapi blog collection exists. The shape matches `BlogPost`
 * (src/lib/blog.ts), so moving to Strapi only changes where this array comes from.
 */
const team = {
  nadia: { name: 'Nadia Rahman', initials: 'NR', role: 'Talent Partner' },
  arif: { name: 'Arif Hossain', initials: 'AH', role: 'Product Lead' },
  sara: { name: 'Sara Chowdhury', initials: 'SC', role: 'HR Consultant' },
};

const posts: BlogPost[] = [
  {
    slug: 'what-is-recruitment-software',
    title: 'What is Recruitment Software?',
    excerpt: 'A plain-English guide to the tools that post jobs, screen applicants and move candidates to an offer, and how to pick the right one for your team.',
    category: 'HR operations', author: team.nadia, date: '2026-11-19', readMinutes: 8,
    cover: { icon: 'briefcase', label: 'Hiring pipeline', value: 'One place' }, popularity: 65, tags: ['ATS'],
  },
  {
    slug: 'ai-recruiting-trends-2026',
    title: 'Seven AI recruiting trends talent teams should plan for in 2026',
    excerpt: 'Skills-based matching, structured AI interviews and evidence-linked scores are moving from pilots to everyday hiring. Here is what changes for recruiters.',
    category: 'AI in recruiting', author: team.arif, date: '2026-11-12', readMinutes: 8,
    cover: { icon: 'sparkles', label: 'Job Fit Score', value: '92' }, featured: true, popularity: 90,
    tags: ['skills-based hiring', 'ai interview'],
  },
  {
    slug: 'screen-1000-resumes-without-losing-quality',
    title: 'How to screen 1,000 resumes without losing quality',
    excerpt: 'A repeatable screening rubric, the must-have versus nice-to-have split, and where automation should stop and people should decide.',
    category: 'Resume screening', author: team.nadia, date: '2026-11-05', readMinutes: 6,
    cover: { icon: 'scan', label: 'Resumes screened', value: '1,200' }, popularity: 70, tags: ['ATS'],
  },
  {
    slug: 'structured-interview-questions',
    title: 'Structured interviews: 30 questions that predict on-the-job success',
    excerpt: 'Same questions, same rubric, every candidate. A question bank for engineering, sales and support roles, with scoring notes.',
    category: 'Interviews', author: team.sara, date: '2026-10-29', readMinutes: 10,
    cover: { icon: 'mic', label: 'AI Interview Score', value: '88' }, popularity: 100, tags: ['interview rubric'],
  },
  {
    slug: 'candidate-experience-checklist',
    title: 'The candidate experience checklist for fast-growing teams',
    excerpt: 'Response times, clear stages and a booking flow candidates can finish on their phone. Small fixes that lift offer acceptance.',
    category: 'Candidate experience', author: team.nadia, date: '2026-10-21', readMinutes: 5,
    cover: { icon: 'calendar', label: 'Slot booked', value: 'Tue 10:30' }, popularity: 40,
  },
  {
    slug: 'reduce-time-to-hire',
    title: 'Cutting time to hire in half: a stage-by-stage playbook',
    excerpt: 'Find the stage where candidates wait longest, then fix it first. A practical audit you can run on your own pipeline this week.',
    category: 'Hiring strategy', author: team.arif, date: '2026-10-14', readMinutes: 7,
    cover: { icon: 'hourglass', label: 'Longest wait', value: 'HR Round' }, popularity: 60, tags: ['time to hire'],
  },
  {
    slug: 'interview-integrity-remote-hiring',
    title: 'Interview integrity in remote hiring: what to monitor and why',
    excerpt: 'Tab switches, focus loss and copy-paste events, explained. How to review integrity signals fairly without treating every candidate as a suspect.',
    category: 'Interviews', author: team.sara, date: '2026-10-07', readMinutes: 6,
    cover: { icon: 'shield', label: 'Integrity events', value: '1 to review' }, popularity: 80, tags: ['remote hiring'],
  },
  {
    slug: 'job-description-that-attracts',
    title: 'Write a job description that attracts the right applicants',
    excerpt: 'Lead with outcomes, list real requirements and cut the wish list. Templates for five common roles.',
    category: 'Hiring strategy', author: team.nadia, date: '2026-09-30', readMinutes: 5,
    cover: { icon: 'file', label: 'Job post', value: 'Published' }, popularity: 30, tags: ['job description'],
  },
  {
    slug: 'ats-migration-guide',
    title: 'Moving to a new ATS without losing a single candidate',
    excerpt: 'A migration plan for HR operations: what to export, how to map stages and how to keep live pipelines running during the switch.',
    category: 'HR operations', author: team.arif, date: '2026-09-22', readMinutes: 9,
    cover: { icon: 'briefcase', label: 'Open jobs', value: '12' }, popularity: 20, tags: ['ATS'],
  },
  {
    slug: 'bias-in-ai-hiring',
    title: 'Reducing bias in AI hiring: a practical guide for HR leaders',
    excerpt: 'Where bias enters a hiring funnel, how structured scoring helps, and the checks to run before you trust any model.',
    category: 'AI in recruiting', author: team.sara, date: '2026-09-15', readMinutes: 8,
    cover: { icon: 'users', label: 'Shortlisted', value: '4 of 600' }, popularity: 50, tags: ['bias'],
  },
  {
    slug: 'career-page-that-converts',
    title: 'Your career page is a landing page. Treat it like one',
    excerpt: 'Clear roles, honest culture notes and a one-minute apply flow. What separates career pages that convert from those that do not.',
    category: 'Candidate experience', author: team.nadia, date: '2026-09-08', readMinutes: 4,
    cover: { icon: 'globe', label: 'Apply flow', value: '1 min' }, popularity: 10,
  },
];

/** Posts with their article body attached (when one exists). */
export const blogPosts: BlogPost[] = posts.map((p) => {
  const body = blogArticles[p.slug];
  return body ? { ...p, body } : p;
});
