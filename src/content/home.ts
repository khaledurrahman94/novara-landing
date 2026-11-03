/** All home page copy. Marketing may edit this file; components render it. The labs keep their own copy files. */

/**
 * Link visibility: a nav, hero or footer link renders only when its `live` flag is true, so no link points at a page
 * that does not exist yet. The data stays here: when a page ships, flip its `live` to true (one word). Every live
 * internal link is also checked against the site's pages at build time (see homeProvider in src/lib/pages.ts).
 */


/** Where "Sign in" sends existing customers. */
export const SIGN_IN_HREF = 'https://app.novara.com.my/sign-in';
/** Where "Get started" sends new customers. */
export const ONBOARDING_HREF = 'https://app.novara.com.my/onboarding';

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
    /** Label of the hero's demo button (CMS field `nav.cta`); the header has no demo button. */
    cta: 'Request a demo',
    signIn: { label: 'Sign in', href: SIGN_IN_HREF },
    getStarted: { label: 'Get started', href: ONBOARDING_HREF },
    /** Rendered when `live`. Later items (Platform, Features, Solutions, ROI Calculator, Resources) join this list when their pages exist. */
    links: [
      { label: 'Home', href: '/', live: true },
      { label: 'Contact us', href: '/contact', live: true },
      { label: 'About us', href: '/about', live: true },
      { label: 'Pricing', href: '/pricing', live: true },
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
    sub: 'Novara is an AI recruiting software that combines an applicant tracking system, resume screening, candidate matching, and AI interviews. Novara reduces manual resume screening work, automates candidate assessment, and helps talent acquisition teams shortlist qualified candidates faster.',
    pricing: { label: 'See pricing', href: '/pricing', live: true },
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
  results: {
    title: 'From 1,200+ Applicants to 4 Hires',
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
  /**
   * Real candidates who took the Novara AI interview, quoted verbatim with their permission to link their LinkedIn.
   * `title`, `readMore` and `showLess` are CMS fields; people, quotes and order stay in code (the first four, Mukul, Hridaya, Utsav and Aayush, are the batch that went from 1,200 applicants to 4 offers and are the Offered avatars in Results; the last three are never in the funnel. Code order is the no-JS order only: on each load motion/cast.ts shuffles the four among the Offered seats and the three among themselves, so nobody is prioritised. `key` is the photo file under /public/people).
   */
  testimonials: {
    title: 'What candidates say about the Novara interview.',
    items: [
      { key: 'mukul', name: 'Mukul Aryal', role: 'L1 Software Engineer - AI/ML', href: 'https://www.linkedin.com/in/aryalmukul/', quote: "I wasn't sure an AI could properly assess technical depth, but Novara surprised me. It asked me to walk through how I'd approach a problem, then followed up on my choices, like how I'd evaluate the model and handle trade-offs between accuracy and latency. Whenever my answer was vague, it gently pushed for specifics, which helped me show my thinking more clearly." },
      { key: 'hridaya', name: 'Hridaya Giri', role: 'L1 Software Engineer - AI/ML', href: 'https://www.linkedin.com/in/hridayagiri/', quote: "I could take the interview on my own schedule, late one night after work, without juggling calendars with a recruiter. The voice was clear, the pacing felt comfortable, and the instructions at the start made it obvious what to expect. Honestly, it ran more smoothly than most interviews I've had with people." },
      { key: 'utsav', name: 'Utsav Manandhar', role: 'L1 Software Engineer - AI/ML', href: 'https://www.linkedin.com/in/utsav-manandhar/', quote: "I was nervous about being interviewed by an AI, but Novara felt surprisingly natural. The questions followed on from what I actually said, and it never felt like I was racing a timer. When I paused to think, it gave me room instead of cutting me off. I came out feeling I'd shown what I can really do." },
      { key: 'ayush', name: 'Aayush Dangol', role: 'L1 Software Engineer - AI/ML', href: 'https://www.linkedin.com/in/aayush-dangol-294b0a228/', quote: "I expected generic, scripted questions, but the follow-ups really dug into the projects I'd mentioned: why I chose a particular model architecture, and how I dealt with data drift in production. It felt like talking to a sharp senior engineer. I could tell it was actually listening." },
      { key: 'mandira', name: 'Mandira Sharma', role: '', href: 'https://www.linkedin.com/in/mandira-sharma-bba254276/', quote: 'My experience with the AI Interview feature in the Novara app was really great. The questions were relevant to my work experience, skills, and the requirements of the job position I was applying for. What I particularly appreciated was that it not only simulated a realistic interview but also provided helpful evaluations, constructive feedback, and guidance on areas where I could improve. Overall, it was a valuable experience that helped me better understand my strengths and identify areas for further development.' },
      { key: 'shristee', name: 'Shristee Maharjan', role: 'Associate Software Engineer - AI/ML', href: 'https://www.linkedin.com/in/shristee-maharjan/', quote: 'From resume screening right through to the AI interview, Novara handled every step of the hiring process seamlessly. The interview questions were clear and well-structured, and the conversation flowed naturally instead of feeling scripted. I was especially impressed by the transcription, which captured everything I said accurately. The whole process felt efficient and thoughtfully designed, and it made applying feel much less stressful.' },
      { key: 'pragyan', name: 'Pragyan Shrestha', role: '', href: 'https://www.linkedin.com/in/pragyan-shrestha-2151b8254/', quote: 'I really appreciate the idea behind Novara Interview Engine. It brings a modern approach to the interview process and demonstrates how technology can make recruitment smarter and more efficient.' },
    ],
    linkedinLabel: 'on LinkedIn',
    regionLabel: 'Candidate testimonials, scroll sideways',
    prev: 'Previous testimonials',
    next: 'Next testimonials',
    readMore: 'Read more',
    showLess: 'Show less',
  },
  decide: {
    title: 'Simplify Candidate Shortlisting with AI Powered Insights',
    sub: 'Novara places Job Fit Scores and AI interview evaluations to shortlist qualified candidates for the next stage.',
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
    title: "How Does Novara's AI Recruitment Platform Work?",
    intro: 'Novara’s AI recruiting platform works in nine steps, connecting recruitment automation with your hiring workflow, from job creation to recruiter decision making.',
    steps: [
      { title: 'Create a Job', text: 'Recruiters can create jobs with AI by entering job details or uploading a job description. Novara automatically fills in the relevant fields.' },
      { title: 'Publish the Job', text: 'Recruiters publish vacancies on the career page or share job links to receive applications' },
      { title: 'Receive Applications', text: 'Organize candidate applications by vacancy with Novara’s applicant tracking system and hiring pipeline.' },
      { title: 'Analyze Resumes', text: 'Novara’s AI resume parser extracts details and matches candidate CVs against job requirements' },
      { title: 'Evaluate Job Fit Score', text: 'Review AI-powered Job Fit Scores to rank applicants by relevant skills and experience.' },
      { title: 'Invite Candidates to AI Interviews', text: 'Send AI interview invitations to selected applicants for structured, automated initial candidate assessments.' },
      { title: 'Generate Interview Evaluations', text: 'Novara generates AI interview evaluations and scores against job-related criteria for recruiter review.' },
      { title: 'Shortlist and Manage Candidates', text: 'Review Job Fit Scores and interview results, then move shortlisted candidates through your hiring pipeline.' },
      { title: 'Make the Final Hiring Decision', text: 'Compare candidates, complete final checks, make AI-assisted human-led hiring decisions, and update candidate status.' },
    ],
  },
  platform: {
    title: 'Manage Your Entire Recruitment Workflow into One Place',
    intro:
      'Novara manages the entire recruitment process through automation and applicant tracking system that keeps candidate management, interview scheduling, and hiring analytics together, ensuring a smooth hiring pipeline for recruiters.',
    tiles: {
      dashboard: { title: 'Dashboard', line: 'Active jobs, your to-dos, a jobs overview and recent activity in one view.' },
      jobs: { title: 'Jobs', line: 'Create AI-assisted job postings from descriptions, share across job boards, and track vacancy status.' },
      candidate: { title: 'Candidates Profile', line: 'Turn parsed resumes into organized candidate profiles with Job Fit Scores and interview history.' },
      pipeline: { title: 'Pipeline Board', line: 'See candidate stages and Job Fit Scores together, without opening every profile.' },
      scheduling: { title: 'Interview Scheduling', line: 'Set available interview slots and manage rescheduling while keeping a record of previous bookings.' },
      interviews: { title: 'Interviews', line: 'Manage interview scheduling and stages, then review AI evaluations with your hiring team.' },
      career: { title: 'Career Page', line: 'Publish a branded career page, then share job links or embed vacancies on your website.' },
      analytics: { title: 'Analytics', line: 'Track application volumes, qualified candidates, and hiring trends over time with recruitment analytics.' },
    },
    copyEmbed: 'Copy embed code',
    copied: 'Copied',
    copyFail: 'Copy failed. Select the code and copy it.',
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
    intro: 'Novara’s AI recruitment platform helps companies, hiring teams, and staffing agencies with one workflow for tracking applications, candidate evaluations, and hiring decisions across different roles and industries.',
    tabsLabel: 'Who Novara is for',
    builtFor: 'Built for',
    cta: 'Book a demo',
    groups: [
      {
        key: 'company',
        label: 'For Company',
        tagline: 'Keep hiring organized as you grow.',
        description: 'Novara’s AI based recruitment automation software helps startups, small businesses, BPOs and enterprises manage growing hiring volumes with automated applicant tracking.',
        built: ['Small and medium businesses', 'Startups and growing companies', 'Enterprise hiring', 'BPO'],
        points: [
          'Create job postings with AI assistance.',
          'Rank applicants using AI Job Fit Scores.',
          'Automate initial screening with AI interviews.',
          'Track candidates through your ATS hiring pipeline.',
        ],
      },
      {
        key: 'role',
        label: 'By Role',
        tagline: 'Give every hiring role clarity.',
        description: 'Recruiters, HR managers and hiring managers review candidate scores, while role-based access keeps hiring information available to authorized users.',
        built: ['HR teams', 'Hiring managers', 'IT', 'Finance'],
        points: [
          'Recruiters track applicants through the hiring pipeline.',
          'HR managers compare AI Job Fit Scores.',
          'Hiring managers review interview evaluation reports.',
          'Admins control role-based access permissions.',
        ],
      },
      {
        key: 'industry',
        label: 'Industry',
        tagline: 'Match talent to industry requirements.',
        description: 'For healthcare, manufacturing, finance and technology roles, Novara matches candidate skills against job requirements and supports structured interviews.',
        built: ['Healthcare', 'Manufacturing', 'Insurance', 'Transportation', 'Accounting', 'Information technology'],
        points: [
          'Set industry-specific skills and hiring criteria.',
          'Match candidate resumes against job requirements.',
          'Rank applicants using AI Job Fit Scores.',
          'Assess candidates through structured AI interviews.',
        ],
      },
      {
        key: 'agency',
        label: 'Recruitment & Staffing Agencies',
        tagline: 'Manage client hiring without screening backlogs.',
        description: 'Recruitment and staffing agencies can track client vacancies, compare candidate assessments and shortlist applicants for direct hire or executive search.',
        built: ['In-house recruitment', 'Corporate recruiting', 'Executive search firms', 'Direct hire agencies', 'Consulting and staffing firms'],
        points: [
          'Track multiple client vacancies in one ATS.',
          'Match candidate profiles to client requirements.',
          'Prioritize shortlists using AI interviews and AI Job Fit Scores.',
          'Monitor shortlisted candidates through each hiring pipeline.',
        ],
      },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions About Novara',
    items: [
      {
        q: "How is Novara different from other AI recruiting software?",
        a: "Novara combines AI resume screening, Job Fit Scores, AI interviews, and anti-cheat monitoring in one platform. Instead of managing separate screening and assessment processes, recruiters can compare candidate suitability and interview performance in one place.",
      },
      {
        q: "Does Novara decide who gets hired?",
        a: "Novara does not decide who gets hired. Your hiring team always makes the final decision. Novara uses Job Fit Scores and AI interview evaluations to help recruiters assess candidates against job requirements. You review the results, conduct any additional interviews, and decide who gets hired.",
      },
      {
        q: "How does Novara handle high-volume hiring?",
        a: "Novara’s applicant tracking system keeps every application organized. AI resume screening matches CVs against job requirements, while Job Fit Scores help prioritize suitable applicants. Then recruiters use AI interviews to assess selected candidates and narrow the shortlist. This helps recruiters identify suitable candidates and manage large applicant pools efficiently.",
      },
      {
        q: "How long does it take to set up?",
        a: "Novara's initial setup takes approximately 5–10 minutes, depending on your hiring requirements and the number of hiring stages. Simply create a job or upload a job description, and Novara automatically fills in the relevant fields. Review the job requirements, configure your hiring stages, and you're ready to publish your vacancy.",
      },
      {
        q: "Can I integrate with job boards, calendars or our existing ATS?",
        a: "Yes. Novara integrates with job boards like LinkedIn and Indeed to publish vacancies and manage applications in one place. Connect Google Calendar or Microsoft 365 to sync interview schedules, and use Zapier to connect other recruitment tools. You can also import candidate and job data from your existing ATS to make switching easier.",
      },
      {
        q: "Is Novara suitable for a small team with no dedicated recruiter?",
        a: "Yes. With Novara, small businesses don't need a dedicated recruiter to manage hiring. Its applicant tracking system keeps applications organized. The AI resume screening and AI interviews reduce manual work. You can review candidate assessments and make hiring decisions without managing every step manually.",
      },
      {
        q: "How much of my screening work will the AI take over?",
        a: "Novara automates almost everything involved in initial candidate screening. AI resume screening matches CVs against job requirements and generates Job Fit Scores. AI interviews further reduce manual assessment to find qualified candidates. Thus, your recruiting team does the shortlisting and final hiring decisions.",
      },
      {
        q: "Is our candidate data secure, private, and separate from other companies?",
        a: "Yes. Novara protects candidate data through role-based access controls and security measures designed to prevent unauthorized access. The system allows you to control who can view applications and interview results. Our data security policies prohibit unauthorized access to another company's information. Our privacy policies also govern how candidate information is used, shared, and retained.",
      },
      {
        q: "Can my whole hiring team use it?",
        a: "Yes. HR managers and recruiters can use Novara’s applicant tracking system to review candidate assessments and track applicants in one hiring pipeline. Role-based access controls what each team member can view and collaborate on hiring decisions while protecting sensitive candidate information.",
      },
    ],
  },
  close: {
    title: 'Meet Only the Right Candidates with AI Recruitment',
    line: 'Spend less time screening and more time hiring the right candidates with Novara',
  },
  footer: {
    line: 'Resume screening, AI interviews and your hiring pipeline in one platform.',
    nav: 'Footer',
    maker: 'A product of Vivasoft',
    makerHref: 'https://vivasoftltd.com/products/',
    makerImage: 'https://previea.ai/wp-content/uploads/2026/05/A-product-of-viva.png',
    copyright: '© 2026 Novara',
    rights: 'All rights reserved.',
    followLabel: 'Follow us',
    contact: {
      email: 'dinno@novara.my',
      phone: '+60 11 6267 7447',
      address: 'A-26-30, Neu Suites, 3rd Avenue, Kuala Lumpur 55000, Malaysia.',
    },
    /** Real profile URLs are not known yet. An empty href hides that icon. */
    social: [
      { key: 'linkedin', label: 'LinkedIn', href: '' },
      { key: 'x', label: 'X', href: '' },
      { key: 'youtube', label: 'YouTube', href: '' },
      { key: 'instagram', label: 'Instagram', href: '' },
    ] as { key: string; label: string; href: string }[],
    /** A column renders only while at least one of its links is `live`. */
    columns: [
      {
        label: 'Product',
        links: [
          { label: 'ATS', href: '/ats', live: false },
          { label: 'AI interview', href: '/ai-interview', live: false },
          { label: 'Features', href: '/features', live: false },
          { label: 'Solutions', href: '/solutions', live: false },
          { label: 'ROI Calculator', href: '/roi-calculator', live: false },
          { label: 'Integration', href: '/integrations', live: false },
        ],
      },
      {
        label: 'Company',
        links: [
          { label: 'Home', href: '/', live: true },
          { label: 'Contact us', href: '/contact', live: true },
          { label: 'About us', href: '/about', live: true },
          { label: 'Pricing', href: '/pricing', live: true },
          { label: 'Terms and policies', href: '/terms', live: true },
          { label: 'Resources', href: '/resources', live: false },
          { label: 'Security', href: '/security', live: false },
        ],
      },
    ],
    aiSummary: {
      label: 'Get an AI summary of Novara',
      /** Sent to each assistant in a `?q=` link, so keep it short: the encoded URL must stay well under ~4000 characters. */
      prompt: `Read https://novara.my/ (the home page). Explain Novara in plain language to a client: what it is (an AI recruitment platform and ATS by Vivasoft), who it is for, and how it works step by step (create and publish a job, receive applications, resume analysis with explained Job Fit Scores, AI interviews for chosen candidates, interview evaluation, shortlisting, final decision by the hiring team). Say what differs from a normal ATS (explained scores, AI first-round interviews with integrity monitoring, humans make every decision). Give one concrete example, such as a backend engineer role with hundreds of applicants. Keep to what the pages say, say what is unclear instead of guessing, and avoid marketing language. End with three questions a buyer should ask in a demo.`,
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
