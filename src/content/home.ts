/** All home page copy. Marketing may edit this file; components render it. The labs keep their own copy files. */
export const home = {
  seo: {
    title: 'Novara: try AI resume screening and AI interviews',
    description:
      'Re-rank resumes, try to cheat an AI interview and make the shortlist call yourself. Novara shows your hiring team the evidence. Request a demo.',
  },
  nav: {
    label: 'Primary',
    home: 'Novara, back to top',
    anchors: [
      { label: 'Results', href: '#results' },
      { label: 'Screening', href: '#screen' },
      { label: 'Interview', href: '#interview-lab' },
      { label: 'How it works', href: '#how' },
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
    fallback: 'The demo form is not connected yet. Please check back soon.',
  },
  hero: {
    title: 'Hire the person, not the pile.',
    sub: 'Novara scores every resume against the job, runs the first round with an AI interviewer, and shows your team the evidence behind every shortlist.',
    secondary: 'Try the AI interview',
    shotCaption: 'Novara candidate review: ranked applicants on the left, and Amara Okafor with a Job Fit Score of 92, an AI Interview Score of 88 and one integrity event to review.',
    chips: {
      node: 'Matched: Node.js',
      postgres: 'Matched: PostgreSQL',
      k8s: 'Missing: Kubernetes',
      fit: 'Job Fit 92',
      interview: 'AI Interview 88',
      focus: 'Focus lost 3s',
      moved: 'Moved by Priya',
      rank: 'Ranked 1 of 6',
    },
  },
  /**
   * Trust strip after the hero. Renders only when `logos` has real entries, so it ships empty.
   * Add only confirmed customers: no invented names, counts or quotes. `src` is a path under /public or an https URL.
   */
  socialProof: {
    heading: 'Trusted by hiring teams at',
    count: '',
    logos: [] as { name: string; src: string; href?: string }[],
  },
  results: {
    title: 'From 1,200+ applicants to 4 offers.',
    caption: 'Illustrative funnel for an engineering hire. Not a customer result.',
    figures: [
      { key: 'applied', label: 'Applied', note: 'Resumes received for the role.', callout: '', value: 1200, suffix: '+' },
      { key: 'interviewed', label: 'AI interviews', note: "Scored against the job's requirements, then invited to the AI interview.", callout: '', value: 600, suffix: '' },
      { key: 'shortlisted', label: 'HR Round', note: 'Moved to the HR round after the AI interview.', callout: '12 of the 600 interviewed', value: 12, suffix: '' },
      { key: 'hired', label: 'Offered', note: 'Offers made after the HR round.', callout: '4 of the 12 in the HR round', value: 4, suffix: '' },
    ],
    hintFine: 'Hover an applicant. Values are illustrative.',
    hintTouch: 'Tap an applicant. Values are illustrative.',
    phases: [
      '1,200+ applicants, one dot each.',
      "Screened against the job's requirements.",
      'Took the AI interview.',
      'Moved to the HR round.',
      'Offers made.',
    ],
    legend: ['Applied', 'AI interviews', 'HR Round', 'Offered'],
    hired: 'Offered',
  },
  decide: {
    title: 'You decide who moves on. Novara shows you why.',
    sub: 'Drag Amara to your HR round. That call is yours.',
    caption: 'A pipeline with two columns. Drag Amara Okafor from Completed to HR Round, with her evidence shown beside it.',
    from: 'Completed',
    to: 'HR Round',
    stamp: 'Moved on by you',
    dragHelp: 'Drag this card between the columns. With the keyboard, press the right arrow to move it to HR Round and the left arrow to move it back to Completed.',
    drop: 'Drop here',
    movedStatus: 'Amara Okafor moved to HR Round by you.',
    backStatus: 'Amara Okafor moved back to Completed.',
    evidenceTitle: 'The evidence',
    evaluation: {
      interviewScore: 'AI Interview Score',
      fitScore: 'Job Fit Score',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      opportunities: 'Opportunities',
      threats: 'Threats',
    },
    evidence: {
      amara: {
        jobFit: 92,
        score: 88,
        swot: {
          strengths: 'Clear, structured answers on service design.',
          weaknesses: 'Little hands-on Kubernetes.',
          opportunities: 'Could lead the API migration work.',
          threats: 'Likely to have other offers.',
        },
      },
      ines: {
        jobFit: 84,
        score: 81,
        swot: {
          strengths: 'Strong PostgreSQL and event-driven design.',
          weaknesses: 'Shorter time in senior roles.',
          opportunities: 'Could own data-heavy services.',
          threats: 'May want a wider scope than the role has.',
        },
      },
      kenji: {
        jobFit: 79,
        score: 84,
        swot: {
          strengths: 'Methodical problem solving in large codebases.',
          weaknesses: 'Node.js use is limited to side services.',
          opportunities: 'Could shape service design standards.',
          threats: 'Ramp-up time on the Node.js stack.',
        },
      },
    },
    note: 'Novara scores out of 100. Names and evaluation wording in this demo are illustrative.',
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
      analytics: { title: 'Analytics', line: 'Track how candidate numbers change across each stage over time.' },
    },
    copyEmbed: 'Copy embed code',
    copied: 'Copied',
    copyFail: 'Copy failed. Select the code and copy it.',
    candidateName: 'Candidate name',
    candidateNamePlaceholder: 'Try a name, like Amara',
    restore: 'Restore default',
    save: 'Save',
    saved: 'Saved',
    hoverBar: 'Hover a bar for the week.',
    trend: {
      Applications: [4, 9, 16, 31, 38],
      Qualified: [2, 8, 9, 22, 20],
      'AI Interviews': [1, 5, 3, 9, 6],
      Selected: [0, 1, 0, 2, 1],
    },
    note: 'Numbers in these views are illustrative.',
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
  notFound: {
    title: "We can't find that page",
    line: 'The link may be old or mistyped. The home page has the live demos and the demo request form.',
    cta: 'Go to the home page',
  },
} as const;
