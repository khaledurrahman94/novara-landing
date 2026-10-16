/** All V2 page copy. Marketing may edit this file; components render it. */
export const v2 = {
  seo: {
    title: 'Novara: AI resume screening and AI interviews for hiring teams',
    description:
      'Novara scores every resume against the job, runs AI first-round interviews and shows your team the evidence. Request a demo.',
  },
  nav: {
    label: 'Primary',
    home: 'Novara, back to top',
    anchors: [
      { label: 'Product', href: '#product' },
      { label: 'How it works', href: '#how' },
      { label: 'Results', href: '#results' },
      { label: 'FAQ', href: '#faq' },
    ],
    cta: 'Request a demo',
  },
  form: {
    label: 'Work email',
    placeholder: 'Work email',
    submit: 'Request a demo',
    error: 'Enter a work email, like name@company.com.',
    sendError: 'Something went wrong. Please try again.',
    success: 'Thanks. We will be in touch to book your demo.',
    sending: 'Sending',
  },
  hero: {
    eyebrow: 'AI resume screening and first-round interviews',
    title: 'Hire the person, not the pile.',
    sub: 'Novara scores every resume against the job, runs the first round with an AI interviewer, and shows your team the evidence behind every shortlist.',
    shotCaption:
      'Novara candidate review: ranked applicants on the left, and Amara Okafor with a Job Fit Score of 92, an AI Interview Score of 88 and one integrity event to review.',
  },
  results: {
    eyebrow: 'Results',
    title: 'From 1,200+ applicants to 4 hires.',
    caption: 'One real hiring round for engineering roles, run on Novara.',
    figures: [
      { key: 'applied', label: 'Applied', value: 1200, suffix: '+' },
      { key: 'interviewed', label: 'Took the AI interview', value: 600, suffix: '' },
      { key: 'shortlisted', label: 'Shortlisted', value: 12, suffix: '' },
      { key: 'hired', label: 'Hired', value: 4, suffix: '' },
    ],
  },
  features: {
    screen: {
      title: 'Every resume, read against the job.',
      line: "Novara parses each resume and gives it a Job Fit Score: what matches, what's missing, and why.",
      caption: 'Applicants ranked by Job Fit Score next to the reasons for one score.',
    },
    interview: {
      title: 'First-round interviews, without the calendar.',
      line: "Candidates pick a slot and take a structured interview with Novara's AI interviewer. Integrity checks flag moments for your review.",
      caption: 'A live AI interview with captions, next to its integrity events.',
    },
    decide: {
      title: 'You decide who moves on. Novara shows you why.',
      line: 'Every answer scored, every flag timestamped, the recording a click away. Move the right people to your HR round.',
      caption: 'An AI Interview Score of 88 with question scores, and a candidate moved from Completed to HR Round by Priya.',
      stamp: 'Moved by Priya',
      from: 'Completed',
      to: 'HR Round',
    },
  },
  how: {
    title: 'How it works',
    steps: [
      { title: 'Post the job', text: 'Novara drafts the description from the role, level and skills.' },
      { title: 'Candidates apply', text: 'From your branded career page or a shared link.' },
      { title: 'Screen and interview', text: 'A Job Fit Score for every resume, and AI first rounds for the candidates you invite.' },
      { title: 'You decide', text: 'Review the evidence and move people to your HR round.' },
    ],
  },
  platform: {
    title: 'Everything between apply and offer.',
    tiles: {
      pipeline: { title: 'Pipeline board', line: 'Every candidate in a named stage, from Applied to Offered or Rejected.' },
      career: { title: 'Career page', line: 'Branded, with embed code for your site and a link for every job.' },
      scheduling: { title: 'Interview scheduling', line: 'Recruiters set the slots. A reschedule keeps the old booking on record.' },
      roles: { title: 'Roles and permissions', line: 'Admin, HR Manager and Recruiter, with role-based access.' },
      email: { title: 'Email templates', line: 'Fill in variables, or restore the default.' },
      analytics: { title: 'Analytics', line: 'See how many candidates sit in each stage.' },
    },
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'Does Novara decide who gets hired?',
        a: 'No. Novara scores resumes and interviews and shows its reasons. Your team decides who moves on, who gets an HR round and who gets an offer.',
      },
      {
        q: 'What is the AI interview like for candidates?',
        a: "Candidates pick a time slot, then talk with Novara's AI interviewer. Questions are written for the role by Novara, alongside any your team adds.",
      },
      {
        q: 'How does Novara handle cheating?',
        a: 'During the interview, Novara watches for tab switching, leaving full screen, copy and paste, the camera turning off, more than one face, and looking away. Each event is timestamped in the report for your team to review.',
      },
      { q: 'Can we add our own interview questions?', a: 'Yes. Add your own questions alongside the ones Novara writes for the role.' },
      {
        q: 'Can candidates reschedule?',
        a: 'Yes. They pick a new slot from the times your team sets, and the original booking stays on record.',
      },
      {
        q: 'Can we list jobs on our own website?',
        a: 'Yes. Novara gives you a branded career page with embed code for your site, plus a shareable link for every job.',
      },
      {
        q: 'Who on our team can use it?',
        a: 'Admins, HR managers and recruiters, each with role-based access. Invite teammates by email.',
      },
      {
        q: 'Is our data kept separate from other companies?',
        a: "Yes. Each company's users, jobs, candidates, resumes, recordings and reports are isolated, with separate storage per company.",
      },
    ],
  },
  close: {
    title: 'Meet only the people worth meeting.',
    line: 'Request a demo to see Novara screen, interview and explain.',
  },
  footer: {
    line: 'Resume screening, AI interviews and your hiring pipeline in one platform.',
    nav: 'Footer',
    maker: 'A product of Vivasoft',
    makerHref: 'https://vivasoftltd.com/products/',
    copyright: '© 2026 Novara',
    footnote:
      'Names and profiles in product views are illustrative. Results figures are from one real hiring round for engineering roles.',
  },
} as const;
