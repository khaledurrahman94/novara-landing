/**
 * Company page copy (About, Contact) and the shared contact details. Code-owned for now: no CMS wiring.
 * See docs/implementation/07-company-pages.md for what is still unconfirmed.
 */
import { HOME_DEMO_HREF } from '../lib/home-path';
import { SIGN_IN_HREF } from './home';

/**
 * PENDING DM TEAM CONFIRMATION: these details were taken from novara.my (and the DM team's legal draft).
 * Used by /contact, /about and the legal pages. Change them here only.
 */
export const contact = {
  email: 'dinno@novara.my',
  phone: '+60 11 6267 7447',
  phoneHref: 'tel:+601162677447',
  address: 'A-26-30, Neu Suites, 3rd Avenue, Kuala Lumpur 55000, Malaysia',
  website: 'https://novara.my/',
} as const;

export const company = {
  about: {
    seo: {
      title: 'About Novara | AI-powered recruitment',
      description: 'Novara is an AI-powered applicant tracking system that brings resume analysis, job-fit scoring and AI interviews into one hiring platform.',
    },
    eyebrow: 'About Novara',
    title: 'AI-Powered Recruitment. Built for Better Hiring Decisions.',
    intro: [
      'Novara is an AI-powered Applicant Tracking System (ATS) that helps organizations manage recruitment, evaluate candidates, and streamline hiring workflows through a single platform.',
      'We combine applicant tracking with AI-powered resume analysis, job-fit scoring, and interview evaluation to help recruiters move beyond manual screening and fragmented recruitment processes.',
    ],
    whatWeDo: {
      title: 'What We Do',
      lead: 'Novara supports recruitment teams throughout the hiring process, from reviewing applications to evaluating candidates.',
      items: [
        { title: 'AI Resume Analysis', text: 'Analyze candidate resumes to identify relevant skills, qualifications, and experience.' },
        { title: 'Job-Fit Scoring', text: 'Compare candidate profiles against job requirements and provide supporting explanations to help recruiters understand candidate-job alignment.' },
        { title: 'AI Interview Evaluation', text: 'Conduct AI-powered interviews and generate structured evaluations to support candidate assessment.' },
        { title: 'Applicant Tracking', text: 'Manage job postings, applications, candidate progress, and recruitment stages in one place.' },
        { title: 'Recruitment Insights', text: 'Bring candidate information and AI-generated evaluations together to support more structured, informed recruitment workflows.' },
      ],
    },
    sections: [
      {
        title: 'Our Mission',
        paragraphs: ['Our mission is to simplify recruitment through practical AI technology, helping organizations reduce repetitive screening work and evaluate candidates with greater clarity.'],
      },
      {
        title: 'Our Approach',
        paragraphs: [
          'We believe AI should support better decisions, not replace human judgment.',
          'Novara is designed to make recruitment workflows more structured and candidate evaluations more informative. Employers remain responsible for reviewing AI-generated outputs, applying appropriate human oversight, and making hiring decisions.',
        ],
      },
      {
        title: 'Who We Serve',
        paragraphs: [
          'Novara supports organizations, HR teams, recruiters, and hiring managers seeking a more efficient and structured approach to recruitment.',
          'Whether managing a growing volume of applications or improving the consistency of candidate assessments, Novara brings recruitment management and AI-powered evaluation together in one platform.',
        ],
      },
    ],
    cta: {
      title: 'Get Started with Novara',
      line: 'Discover a more structured way to manage recruitment and evaluate candidates.',
      primary: { label: 'Get Started', href: SIGN_IN_HREF },
      secondary: { label: 'Contact Us', href: '/contact' },
    },
  },
  contact: {
    seo: {
      title: 'Contact Novara | Email, phone and address',
      description: 'Contact the Novara team by email or phone, find our Kuala Lumpur address, or book a demo of AI resume screening and AI interviews.',
    },
    eyebrow: 'Contact us',
    title: 'Talk to the Novara team',
    line: 'Reach us by email or phone, or book a demo.',
    labels: { email: 'Email', phone: 'Phone', address: 'Address', website: 'Website' },
    demo: { label: 'Book a demo', href: HOME_DEMO_HREF },
  },
} as const;
