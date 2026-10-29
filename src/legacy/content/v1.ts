/** Every visible V1 marketing string. Product-UI labels live in the shared UI components. */
import { round } from '../data/demo';

export const v1 = {
  meta: {
    title: 'Novara | AI resume screening and AI interviews for hiring teams',
    description:
      'Novara scores every resume against the job, runs the first-round AI interview and shows your team the evidence behind every shortlist.',
  },
  header: {
    anchors: [
      { label: 'How it works', href: '#how' },
      { label: 'Job Fit', href: '#fit' },
      { label: 'AI interview', href: '#interview' },
      { label: 'Platform', href: '#platform' },
    ],
    cta: 'Request a demo',
    nav: 'Primary',
  },
  hero: {
    lines: ['Screen every resume.', 'Interview every candidate.', 'Hire the person, not the pile.'],
    sub: 'Novara scores every resume against the job, runs the first-round interview with an AI interviewer, and shows your team the evidence behind every shortlist.',
    primary: 'Request a demo',
    secondary: 'See how it works',
    stats: [
      { value: 1200, display: round.applied, suffix: '+', label: 'applied' },
      { value: 600, display: String(round.interviewed), suffix: '', label: 'AI interviews' },
      { value: 4, display: String(round.hired), suffix: '', label: 'hired' },
    ],
    caption: 'One real hiring round for engineering roles.',
    compositionLabel: 'Product preview: a Job Fit Score, an AI interview and the hiring pipeline',
    chips: { job: 'Job post', jobValue: 'Published', pipeline: 'Pipeline' },
  },
  how: {
    eyebrow: 'How it works',
    title: 'One hiring round, start to shortlist.',
    steps: [
      { title: 'Create the job', line: 'Novara drafts the description from the role, level and key skills. You edit and publish.', caption: 'A drafted job description for Backend Engineer (Node.js)' },
      { title: 'Screen resumes', line: 'Every resume is parsed and scored against the job.', caption: 'Applicants ranked by Job Fit Score' },
      { title: 'Job Fit', line: 'See what matches, what’s missing, and why.', caption: 'Job Fit Score with matched and missing criteria' },
      { title: 'AI interview', line: 'Candidates pick a slot and take the first round with Novara’s AI interviewer.', caption: 'A candidate picking an interview slot' },
      { title: 'Integrity', line: 'Tab switches, a second face, copy and paste: flagged with timestamps for your review.', caption: 'Integrity counters and a timestamped timeline' },
      { title: 'You decide', line: 'Review the scores, the recording and the flags. Move the right people to your HR round.', caption: 'Pipeline board with a candidate moved to HR Round' },
    ],
    listLabel: 'Steps of one hiring round',
  },
  fit: {
    eyebrow: 'Job Fit',
    title: 'You decide who moves on. Novara shows you why.',
    scoreLabel: 'Job Fit Score',
    chip: 'Qualified',
    figure: 'Job Fit Score for Amara Okafor with matched and missing criteria',
    list: 'Applicants ranked by Job Fit Score',
  },
  interview: {
    title: 'Meet your AI interviewer. Review every answer.',
    line: 'Structured first rounds candidates can take any time. Integrity checks run alongside and flag moments for you to review.',
    figure: 'An AI interview with live captions, integrity checks and an interview score',
  },
  platform: {
    eyebrow: 'Platform',
    title: 'Everything between apply and hired.',
    tabsLabel: 'Platform areas',
    tabs: [
      { id: 'pipeline', label: 'Pipeline', heading: 'Every candidate on one board.', body: 'Stages run from Applied to HR Round and on to Offered. Your team moves people forward, and the scores and notes move with them.', caption: 'Pipeline board' },
      { id: 'scheduling', label: 'Scheduling', heading: 'Interview slots candidates book themselves.', body: 'You set the slots. Candidates pick one and can reschedule, and the old booking stays on record.', caption: 'Interview scheduling' },
      { id: 'career', label: 'Career page', heading: 'Your jobs, on a page of your own.', body: 'Publish openings on a career page, share a job link, or embed the list on your own site.', caption: 'Career page with an embed code' },
      { id: 'evaluation', label: 'Evaluation', heading: 'A score for every answer.', body: 'Each interview gets question-level scores and an overall AI Interview Score, with the recording beside them.', caption: 'AI Interview Score with question-level scores' },
      { id: 'analytics', label: 'Analytics', heading: 'See where the volume goes.', body: 'Applicants, interviews, shortlist and hires, drawn to scale. In one real round, 1,200+ applied and 4 were hired.', caption: 'Funnel of one real hiring round, drawn to scale' },
    ],
  },
  cta: {
    title: 'Your next shortlist starts here.',
    line: 'See how Novara screens, interviews and explains, from job post to HR round.',
    emailLabel: 'Work email',
    placeholder: 'name@company.com',
    submit: 'Request a demo',
    errorEmpty: 'Enter your work email.',
    errorInvalid: 'Enter a valid email, like name@company.com.',
    successTitle: 'Thanks, we have your request.',
    successBody: 'We will reach out to the address you entered.',
  },
  footer: {
    line: 'Resume screening, AI interviews and your hiring pipeline in one platform.',
    product: 'A product of Vivasoft',
    productHref: 'https://vivasoftltd.com/products/',
    copyright: '© 2026 Novara',
    footnote:
      'Names and profiles in product views are illustrative. Hiring-round figures are from one real hiring round for engineering roles.',
    navLabel: 'Footer',
  },
};
