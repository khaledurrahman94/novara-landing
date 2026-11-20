import type { PostBlock } from '../lib/blog';

/**
 * PENDING CMS: article bodies keyed by post slug. In Strapi these become the post's rich-text/blocks field;
 * the block shapes are documented in src/lib/blog.ts (`PostBlock`).
 */
export const blogArticles: Record<string, PostBlock[]> = {
  'what-is-recruitment-software': [
    { type: 'paragraph', lead: true, text: 'Recruitment software is any tool that helps a company find, assess and hire people. It replaces inboxes, spreadsheets and sticky notes with one shared place where every applicant, interview and decision is recorded.' },
    { type: 'paragraph', text: 'For a small team it might be a simple job board and applicant list. For a growing company it usually means an applicant tracking system (ATS), automated screening, interview scheduling and reporting, all working from the same candidate record.' },

    { type: 'heading', text: 'What recruitment software does' },
    { type: 'paragraph', text: 'At its core, recruitment software does three jobs: it brings applicants in, helps you decide who to move forward, and keeps everyone on the hiring team informed. Modern tools add AI on top, scoring each resume against the role and running the first interview so recruiters spend their time on the strongest candidates.' },
    { type: 'image', kind: 'body', alt: 'A candidate record shared by the hiring team', caption: 'One candidate record, shared by everyone on the hiring team.' },

    { type: 'heading', text: 'How recruitment software works' },
    { type: 'paragraph', text: 'Most platforms follow the same flow, from the moment a role opens to the day an offer is signed.' },
    {
      type: 'steps',
      title: 'The hiring flow in recruitment software',
      caption: 'From job post to offer: each stage narrows the pool.',
      items: [
        { title: 'Attract', text: 'Post the job and share your career page', icon: 'briefcase' },
        { title: 'Screen', text: 'Score every resume against the role', icon: 'scan' },
        { title: 'Interview', text: 'Run structured, scored interviews', icon: 'mic' },
        { title: 'Hire', text: 'Shortlist, decide and make the offer', icon: 'check' },
      ],
    },

    { type: 'heading', text: 'Key features to look for' },
    { type: 'paragraph', text: 'Feature lists are long. These are the ones that change how fast and how fairly you hire:' },
    {
      type: 'list',
      items: [
        { lead: 'Applicant tracking', text: 'every candidate, stage and note in one pipeline, so nothing lives in someone’s inbox.' },
        { lead: 'Resume screening', text: 'applicants are scored against the job’s must-have requirements, with the matched and missing skills shown.' },
        { lead: 'AI interviews', text: 'a structured first interview that every candidate takes on their own time, scored on the same rubric.' },
        { lead: 'Interview scheduling', text: 'candidates pick a slot that suits both sides, without email back and forth.' },
        { lead: 'Career page', text: 'a branded page that lists open roles and takes applications on any device.' },
        { lead: 'Reporting', text: 'time to hire, source of hire and stage conversion, so you can see where candidates drop off.' },
      ],
    },

    { type: 'heading', text: 'Recruitment software vs. spreadsheets' },
    { type: 'paragraph', text: 'Many teams start with a spreadsheet. Here is how the two compare once hiring picks up.' },
    {
      type: 'table',
      head: ['Area', 'Recruitment software', 'Spreadsheets'],
      rows: [
        ['Applicant intake', 'Applications land in one pipeline automatically', 'Copied in by hand from email and job boards'],
        ['Screening', 'Every resume scored against the job requirements', 'Read one by one'],
        ['Interviews', 'Self-service booking and structured scoring', 'Scheduled over email, notes kept separately'],
        ['Collaboration', 'Shared notes, stages and decisions', 'Version conflicts and lost comments'],
        ['Reporting', 'Time to hire and drop-off by stage, built in', 'Built manually, often out of date'],
        ['Candidate experience', 'Fast replies and clear status updates', 'Depends on how busy the recruiter is'],
      ],
    },

    { type: 'heading', text: 'Benefits for HR teams' },
    { type: 'paragraph', text: 'The biggest gain is time. When screening and first interviews run on their own, recruiters move from sorting resumes to talking with the people most likely to succeed in the role.' },
    {
      type: 'list',
      items: [
        { lead: 'Faster shortlists', text: 'the strongest applicants rise to the top in hours, not weeks.' },
        { lead: 'Fairer decisions', text: 'every candidate is judged on the same questions and the same rubric.' },
        { lead: 'A better candidate experience', text: 'quick replies, clear stages and self-service booking.' },
      ],
    },

    { type: 'heading', text: 'How to choose the right tool' },
    { type: 'paragraph', text: 'Start with your biggest bottleneck. If you drown in applicants, prioritise screening. If interviews take weeks to book, prioritise scheduling. Then check that the tool fits your team size, integrates with your calendar and email, and shows you the evidence behind every score. See [Novara pricing](/pricing) for plan details.' },

    { type: 'heading', text: 'Final thoughts' },
    { type: 'paragraph', text: 'Recruitment software is no longer only for large enterprises. For any team hiring more than a few people a year, one shared system pays for itself in hours saved and better hires.' },
  ],
};
