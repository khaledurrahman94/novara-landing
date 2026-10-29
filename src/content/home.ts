/** All home page copy. Marketing may edit this file; components render it. The labs keep their own copy files. */

/** PLACEHOLDER: the real app sign-in URL is not known yet. Replace before launch. */
export const SIGN_IN_HREF_PLACEHOLDER = 'https://app.novara.my/sign-in';

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
    /** Rendered now. Later items (Platform, Features, Solutions, ROI Calculator, Resources) join this list when their pages exist. */
    links: [
      { label: 'Home', href: '/' },
      { label: 'Sign in', href: SIGN_IN_HREF_PLACEHOLDER },
      { label: 'Contact us', href: '/contact' },
      { label: 'About us', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
    ],
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
    pricing: { label: 'See pricing', href: '/pricing' },
    signIn: { label: 'Sign in', href: SIGN_IN_HREF_PLACEHOLDER },
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
      { title: 'Create a Job', text: 'Enter the role, level and key skills. Novara drafts the description and requirements.' },
      { title: 'Publish the Job', text: 'Go live on your branded career page and as a shareable link, with embed code for your own site.' },
      { title: 'Receive Applications', text: 'Candidates apply with a resume from your career page or a shared link and land in Applied.' },
      { title: 'Analyze Resumes', text: 'Novara reads each resume against the job and shows what matches, what is missing and why.' },
      { title: 'Evaluate Job Fit Scores', text: 'Every applicant gets a Job Fit Score, so you can rank them and choose who to invite.' },
      { title: 'Invite Candidates to AI Interviews', text: 'Invite the candidates you choose. They pick a slot you set and take the interview with an AI interviewer.' },
      { title: 'Generate Interview Evaluation', text: 'Novara scores every answer and the whole interview, with a report, the recording and any integrity flags.' },
      { title: 'Shortlist and Manage Candidates', text: 'Review the resume, Job Fit Score and interview report together, then move people through your stages.' },
      { title: 'Make the Final Hiring Decision', text: 'Move candidates to HR Round, then to Offered or Rejected. Your team makes the call.' },
    ],
  },
  platform: {
    title: 'Everything between apply and offer.',
    intro:
      'The pipeline, career page, interview scheduling, roles, email templates and analytics sit in one workspace. Each view below is built from the Novara dashboard.',
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
  audience: {
    title: 'Recruitment Platform for Every Team, Role and Industry',
    tabsLabel: 'Who Novara is for',
    builtFor: 'Built for',
    cta: 'Book a demo',
    groups: [
      {
        key: 'company',
        label: 'For Company',
        description: 'Post jobs, screen resumes and run first-round interviews from one workspace, whatever your size.',
        built: ['Small and medium businesses', 'Startups and growing companies', 'Enterprise hiring', 'BPO'],
        points: [
          'Draft the job description with AI and share a link for each job',
          'Get a Job Fit Score for every resume against the job',
          'Run AI interviews and read a scored report for each one',
          "Keep each company's data separate from every other company",
        ],
      },
      {
        key: 'role',
        label: 'By Role',
        description: 'Give each person on the hiring team the access and the evidence their part of the process needs.',
        built: ['HR teams', 'Hiring managers', 'IT', 'Finance'],
        points: [
          'Admin, HR Manager and Recruiter roles with module-level access',
          'Assign recruiters to a job and see its applicants in one place',
          'Review matching and missing criteria with the AI reasoning',
          'Read question-level interview scores and watch the recording',
        ],
      },
      {
        key: 'industry',
        label: 'Industry',
        description: 'Set the requirements, skills and experience for any role, then screen and interview against them.',
        built: ['Healthcare', 'Manufacturing', 'Insurance', 'Transportation', 'Accounting', 'Information technology'],
        points: [
          'Define requirements, skills and experience criteria per job',
          'Add your own interview questions to the ones Novara writes',
          'Review integrity events, each timestamped in the interview report',
          'Move candidates from Applied to Offered or Rejected',
        ],
      },
      {
        key: 'agency',
        label: 'Recruitment & Staffing Agencies',
        description: 'Run several searches at once with a shared pipeline, a branded career page and templated emails.',
        built: ['In-house recruitment', 'Corporate recruiting', 'Executive search firms', 'Direct hire agencies', 'Consulting and staffing firms'],
        points: [
          'See every candidate in a named pipeline stage, filtered by job',
          'Publish a branded career page and embed it on your own site',
          'Let candidates pick interview slots, with reschedules kept on record',
          'Send invitations from editable email templates',
        ],
      },
    ],
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
    rights: 'All rights reserved.',
    footnote:
      'Names and profiles in product views are illustrative. The results funnel is illustrative, not a customer result.',
    followLabel: 'Follow us',
    /** Real profile URLs are not known yet. An empty href hides that icon. */
    social: [
      { key: 'linkedin', label: 'LinkedIn', href: '' },
      { key: 'x', label: 'X', href: '' },
      { key: 'youtube', label: 'YouTube', href: '' },
      { key: 'instagram', label: 'Instagram', href: '' },
    ] as { key: string; label: string; href: string }[],
    columns: [
      {
        label: 'Product',
        links: [
          { label: 'ATS', href: '/ats' },
          { label: 'AI interview', href: '/ai-interview' },
          { label: 'Features', href: '/features' },
          { label: 'Solutions', href: '/solutions' },
          { label: 'ROI Calculator', href: '/roi-calculator' },
          { label: 'Integration', href: '/integrations' },
        ],
      },
      {
        label: 'Company',
        links: [
          { label: 'About us', href: '/about' },
          { label: 'Contact us', href: '/contact' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Resources', href: '/resources' },
          { label: 'Security', href: '/security' },
        ],
      },
    ],
    terms: { label: 'Terms and conditions', href: '/terms' },
    aiSummary: {
      label: 'Get an AI summary of Novara',
      prompt: 'Summarize what Novara (https://novara.my/) does, who it is for and how it works.',
      assistants: [
        { key: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/?q=' },
        { key: 'claude', label: 'Claude', url: 'https://claude.ai/new?q=' },
        { key: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app?q=' },
        { key: 'grok', label: 'Grok', url: 'https://grok.com/?q=' },
      ],
    },
  },
  notFound: {
    title: "We can't find that page",
    line: 'The link may be old or mistyped. The home page has the live demos and the demo request form.',
    cta: 'Go to the home page',
  },
} as const;
