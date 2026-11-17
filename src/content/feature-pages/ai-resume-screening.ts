import type { FeaturePageContent } from './types';
import { DEMO_HREF, demoAndExplore, featureShot } from './shared';

const img = (name: string, alt: string, width: number, height: number) => featureShot('ai-resume-screening', name, alt, width, height);
const explore = '#how-it-works';

export const aiResumeScreening: FeaturePageContent = {
  seo: {
    title: 'AI Resume Screening Software | Novara',
    description:
      'Parse resumes automatically, match candidates against job requirements and rank every applicant with explainable AI Job Fit Scores in Novara.',
  },
  hero: {
    title: 'AI Resume Screening Software to Identify Best-Fit Candidates',
    text: 'Automatically parse resumes, match candidate qualifications against job requirements, and evaluate suitability with AI-powered Job Fit Scores.',
    ctas: demoAndExplore('#resume-parsing'),
    visual: img('resume-matcher', 'Novara AI Resume and Portfolio Matcher ranking roles by match score with skills, experience and portfolio breakdowns', 1348, 844),
  },
  groups: [
    {
      id: 'resume-parsing',
      rows: [
        {
          title: 'Extract Candidate Information with AI Resume Parsing',
          text: 'Upload candidate resumes and let Novara process their information to support job matching and candidate evaluation.',
          ctas: demoAndExplore(explore),
          side: 'left',
          visual: img('resume-parsing', 'A parsed resume beside the candidate profile Novara extracted from it: name, contact, experience, education and skills', 1148, 798),
        },
      ],
    },
    {
      id: 'job-matching',
      rows: [
        {
          title: 'Match Candidate Resumes with Job Requirements Using AI',
          text: 'Compare candidate resumes against job descriptions, including required skills, qualifications, and experience criteria, to identify how closely each applicant fits the role.',
          ctas: demoAndExplore(explore),
          side: 'right',
          visual: img('job-match', 'Job match for a Senior Backend Engineer: requirements marked met, partial or missing beside an overall match of 92', 1148, 736),
        },
      ],
    },
    {
      id: 'job-fit-scores',
      rows: [
        {
          title: 'Evaluate Candidate Suitability with AI Job Fit Scores',
          text: "Understand how well each candidate's resume matches the job description through an overall fit score, matched and missing criteria, and AI-generated reasoning.",
          side: 'left',
          visual: img('job-fit-score', 'Novara AI Job Fit view: an 82% overall match score, job fit, technical, cultural fit and communication scores, strengths and areas for growth', 1600, 1224),
        },
      ],
    },
    {
      id: 'candidate-review',
      rows: [
        {
          title: 'Review Candidate Resumes, Scores, and Applications in One Place',
          text: 'Access candidate profiles, resumes, applications, hiring stages, and evaluation scores from a centralized candidate management interface.',
          ctas: demoAndExplore(explore),
          side: 'right',
          visual: img('candidate-list', 'Candidates for a role with counts for applied, screened, interview and offered, and each candidate’s stage and AI score', 1228, 820),
        },
      ],
    },
  ],
  how: {
    title: 'How Novara AI Resume Screening Works?',
    steps: [
      { title: 'Upload Resume', text: 'Add candidate resumes for parsing.' },
      { title: 'Parse Resume', text: 'Process resume information.' },
      { title: 'Match with Job', text: 'Compare resumes against job criteria.' },
      { title: 'Review Fit Score', text: 'See scores, gaps, and AI reasoning.' },
    ],
  },
  why: {
    title: 'Why Use Novara AI Resume Screening Software?',
    text: 'Screen every applicant the same way, in minutes instead of days, and spend your time on the people worth meeting.',
    cta: { label: 'Book Now', href: DEMO_HREF },
    reasons: [
      { icon: 'zap', title: 'Screen in minutes, not days', text: 'Every resume is parsed and scored the moment it arrives, so nothing waits in a pile.' },
      { icon: 'scale', title: 'The same criteria for everyone', text: 'Each applicant is measured against the same job requirements, from the first resume to the last.' },
      { icon: 'target', title: 'Scores tied to the job', text: 'Fit scores come from your job description, not a generic keyword list.' },
      { icon: 'message', title: 'Reasoning you can check', text: 'See matched and missing criteria and the AI’s explanation behind every score.' },
      { icon: 'layers', title: 'One place for every candidate', text: 'Profiles, resumes, stages and scores live together in one candidate view.' },
      { icon: 'users', title: 'Your team stays in control', text: 'AI ranks and explains; recruiters and hiring managers make the call.' },
    ],
  },
  faq: {
    title: 'FAQs',
    items: [
      { q: 'What is AI resume screening?', a: 'Novara reads each resume, extracts the candidate’s details, and compares them with your job requirements to produce a fit score and a ranked list.' },
      { q: 'How is the Job Fit Score calculated?', a: 'The score weighs skills, experience, domain and education against the job description, and shows the matched and missing criteria behind it.' },
      { q: 'Can I see why a candidate scored the way they did?', a: 'Yes. Every score comes with AI-generated reasoning, strengths and gaps, so you can check the evidence before deciding.' },
      { q: 'Does AI make the final hiring decision?', a: 'No. Novara ranks and explains; your team reviews the shortlist and decides who moves forward.' },
      { q: 'Can I screen candidates for several jobs at once?', a: 'Yes. Each job has its own requirements, so the same candidate can be scored separately for every role they apply to.' },
    ],
  },
  close: {
    title: 'Find Best-Fit Candidates with Novara AI Resume Screening',
    text: 'Every resume is scored against your role the moment it arrives, so your shortlist is ready before you open the inbox.',
    cta: { label: 'Book Demo', href: DEMO_HREF },
  },
};
