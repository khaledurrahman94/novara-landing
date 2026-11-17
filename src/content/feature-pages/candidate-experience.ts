import type { FeaturePageContent } from './types';
import { DEMO_HREF, demoAndExplore, featureShot } from './shared';

const img = (name: string, alt: string, width: number, height: number) => featureShot('candidate-experience', name, alt, width, height);
const overview = (alt: string) => img('candidate-overview', alt, 1200, 1048);

export const candidateExperience: FeaturePageContent = {
  seo: {
    title: 'Candidate Experience Software | Novara',
    description:
      'Give candidates one portal to register, discover jobs, apply, track application status and access interview invitations with Novara.',
  },
  hero: {
    title: 'Candidate Experience Software for a Smoother Hiring Journey',
    text: 'Give candidates one place to discover jobs, submit applications, track their application status, and access interview invitations. Simplify the candidate journey from registration to interview with Novara.',
    ctas: demoAndExplore('#registration'),
    visual: overview('Candidate overview with an applications summary, an interview invitation, deadlines and recommended jobs'),
  },
  groups: [
    {
      id: 'registration',
      rows: [
        {
          title: 'Simplify Candidate Registration and Account Onboarding',
          text: "Allow candidates to register, log in, and complete onboarding to access Novara's job application and interview features.",
          side: 'left',
          visual: img('registration', 'Create account form for candidates with LinkedIn and Google sign-up, name, username, email and password', 1214, 1008),
        },
      ],
    },
    {
      id: 'job-discovery',
      rows: [
        {
          title: 'Help Candidates Discover Relevant Job Opportunities',
          text: 'Let candidates browse and search available job openings from one platform, making it easier to explore opportunities and find positions they want to apply for.',
          side: 'right',
          visual: img('job-search', 'Job search with filters for salary, job type, location and experience beside a grid of open roles', 1474, 890),
        },
      ],
    },
    {
      id: 'job-applications',
      rows: [
        {
          title: 'Make Job Applications Easier with an Online Candidate Portal',
          text: 'Enable candidates to apply for available job openings directly through Novara and manage their applications within the recruitment platform.',
          side: 'left',
          visual: img('job-application', 'Two steps of an online job application: a referral question and a cover letter with CV upload', 1064, 884),
        },
      ],
    },
    {
      id: 'recommended-jobs',
      rows: [
        {
          title: 'Show Candidates Recommended Job Opportunities',
          text: 'Display recommended job openings in the candidate dashboard so applicants can discover additional opportunities available through Novara.',
          side: 'right',
          visual: img('recommended-jobs', 'Candidate dashboard with job matches, application stats, recommended jobs and an application tracker', 1336, 1248),
        },
      ],
    },
    {
      id: 'application-status',
      rows: [
        {
          title: 'Let Candidates Track Their Job Application Status',
          text: 'Give candidates visibility into their active job applications and current application status through a centralized dashboard.',
          side: 'left',
          visual: img('application-status', 'Applied jobs list showing each role, the date applied and its current status', 1236, 1234),
        },
      ],
    },
    {
      id: 'interview-invitations',
      rows: [
        {
          title: 'Keep Candidates Informed with Interview Invitations',
          text: 'Allow candidates to access their interview invitations from the dashboard and continue to the next stage of the recruitment process.',
          side: 'right',
          visual: img('interview-invitation', "Interview invitation showing the candidate's stage progress, a welcome message and the interview time with interviewers", 1124, 728),
        },
      ],
    },
    {
      id: 'candidate-dashboard',
      rows: [
        {
          title: 'Manage Job Applications and Interviews from One Candidate Dashboard',
          text: 'Bring recommended jobs, active applications, and interview invitations together in a single dashboard so candidates can manage their recruitment activities more conveniently.',
          side: 'left',
          visual: overview('Candidate dashboard bringing together applications, an interview invitation and recommended jobs'),
        },
      ],
    },
  ],
  how: {
    title: 'How Novara Candidate Experience Platform Works?',
    intro: 'Four simple steps take a candidate from sign-up to their interview.',
    steps: [
      { title: 'Create Account', text: 'Register, log in, and complete candidate onboarding.' },
      { title: 'Find and Apply', text: 'Browse jobs, search opportunities, and submit applications.' },
      { title: 'Track Applications', text: 'View active applications and their current status.' },
      { title: 'Access Interviews', text: 'Receive and access interview invitations from the dashboard.' },
    ],
  },
  why: {
    title: 'Why Choose Novara for Candidate Experience Management?',
    text: 'Candidates who know where they stand stay engaged. Give them one clear place for jobs, applications and interviews.',
    cta: { label: 'Book Now', href: DEMO_HREF },
    reasons: [
      { icon: 'user', title: 'Quick, simple sign-up', text: 'Candidates register in minutes, with LinkedIn or Google if they prefer.' },
      { icon: 'search', title: 'Jobs that are easy to find', text: 'Search and filters help candidates reach the right roles fast.' },
      { icon: 'send', title: 'Apply without friction', text: 'A short online application means fewer drop-offs.' },
      { icon: 'eye', title: 'Status they can see', text: 'Candidates always know where each application stands.' },
      { icon: 'mail', title: 'Invitations in one place', text: 'Interview invitations arrive in the dashboard, ready to act on.' },
      { icon: 'grid', title: 'One dashboard for everything', text: 'Jobs, applications and interviews live together.' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      { q: 'How do candidates create an account?', a: 'Candidates register with their details or sign up with LinkedIn or Google, then complete a short onboarding.' },
      { q: 'Can candidates search and filter jobs?', a: 'Yes. They can browse open roles and filter by things like job type, location, salary and experience level.' },
      { q: 'How do candidates know where their application stands?', a: 'Their dashboard shows every application with its current status, so they always know what is next.' },
      { q: 'Where do candidates find interview invitations?', a: 'Invitations appear in the candidate dashboard, with the time and details they need to join.' },
    ],
  },
  close: {
    title: 'Create a Smoother Candidate Journey with Novara',
    text: 'From sign-up to interview, give every candidate a clear, simple path through your hiring process.',
    cta: { label: 'Book Now', href: DEMO_HREF },
  },
};
