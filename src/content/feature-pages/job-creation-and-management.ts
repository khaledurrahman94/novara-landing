import type { FeaturePageContent } from './types';
import { DEMO_HREF, featureShot } from './shared';

const img = (name: string, alt: string, height: number) => featureShot('job-creation-and-management', name, alt, 1600, height);

export const jobCreationAndManagement: FeaturePageContent = {
  seo: {
    title: 'Job Creation and Management Software | Novara',
    description:
      'Create job posts in three guided steps, let AI draft the description, set a hiring funnel for each role and track every opening in one list with Novara.',
  },
  hero: {
    title: 'Job Creation and Management',
    text: 'Write a role once, let AI fill in the details, and publish it with your hiring funnel already set. Every opening, draft and expired post stays in one list.',
    ctas: [{ label: 'Explore Features', href: '#create-job-post' }],
    visual: img('jobs-list', 'Novara Jobs page listing total, active, draft and expired jobs with applicants, shortlist and status for each role', 832),
  },
  groups: [
    {
      id: 'create-job-post',
      title: 'Create Job Post',
      intro: 'Three guided steps take a role from a blank form to a live job post. Novara saves your progress at each step, so you can stop and come back without losing anything.',
      rows: [
        {
          eyebrow: 'Step 01',
          title: 'Add Job Details',
          text: 'Fill in the basics: title, job type, workplace, location, experience level, deadline and salary, then add skills and department. Let AI draft the job description from those fields, or write your own.',
          points: ['Fixed or range salary, with a negotiable option', 'Generate the description with AI in one click'],
          side: 'left',
          visual: img('add-job-details', 'Step 1 of posting a job: the Add job details form with job title, job type, workplace, location, experience, deadline and salary', 825),
        },
        {
          eyebrow: 'Step 02',
          title: 'Add Hiring Funnel',
          text: 'Shape the stages every applicant moves through. Set the AI interview duration, deadline and who qualifies for the next stage, then choose whether candidates are invited manually, assigned a slot automatically or pick their own.',
          points: ['Add custom stages between AI interview and offer', 'Control interview permissions and access mode'],
          side: 'right',
          visual: img('hiring-funnel', 'Step 2 of posting a job: the hiring funnel with AI interview settings, qualification criteria and interview access mode', 761),
        },
        {
          eyebrow: 'Step 03',
          title: 'Review and Publish',
          text: 'Check every detail on one screen next to a live preview of the post exactly as candidates will see it. Publish when it looks right, or save it as a draft and finish later.',
          ctas: [
            { label: 'Explore Features', href: '#how-it-works' },
            { label: 'Book Demo', href: DEMO_HREF, variant: 'secondary' },
          ],
          side: 'left',
          visual: img('review-and-publish', 'Step 3 of posting a job: a summary of every field beside a preview of the post as candidates will see it', 749),
        },
      ],
    },
  ],
  how: {
    title: 'How Does It Work?',
    intro: 'Once a job is live, Novara moves each applicant from application to a booked interview, and keeps you in control of who gets invited.',
    steps: [
      { title: 'Candidate Applies', text: 'A candidate finds your published post and applies with their resume in a few clicks.' },
      { title: 'AI Scores Resume', text: 'Novara reads the resume against your job details and gives it a fit score with the reasons behind it.' },
      { title: 'Candidate Joins Review Queue', text: 'Scored applicants land in your review queue, ranked so the strongest fits are at the top.' },
      { title: 'You Send Invitation', text: 'Pick who moves forward and send an interview invitation straight from the queue.' },
      { title: 'Candidate Picks Slot', text: 'The candidate chooses any open slot from your interview schedule before the deadline.' },
      { title: 'Confirms or Reschedules', text: 'The booking is confirmed for both sides, and the candidate can reschedule if plans change.' },
    ],
  },
  why: {
    title: 'Why Choose Novara for AI Job Creation and Management?',
    text: 'Novara turns job posting from a chore into a few minutes of review. AI does the drafting, your funnel does the sorting, and your team sees every role in one place.',
    cta: { label: 'Book Now', href: DEMO_HREF },
    reasons: [
      { icon: 'sparkles', title: 'AI-written job descriptions', text: 'Generate a complete description from the fields you already filled in, then edit it to your voice.' },
      { icon: 'layers', title: 'A funnel built per role', text: 'Set interview stages, deadlines and qualification rules for each job, not one template for all.' },
      { icon: 'eye', title: 'Preview before you publish', text: 'See the post exactly as candidates will, so mistakes never go live.' },
      { icon: 'grid', title: 'Every job in one list', text: 'Track active, draft and expired roles with applicants and shortlist counts side by side.' },
      { icon: 'users', title: 'Built for your whole team', text: 'Recruiters and hiring managers work from the same jobs, with roles and permissions you control.' },
      { icon: 'shield', title: 'Fair, consistent screening', text: 'Every applicant is measured against the same criteria, from the first resume to the last.' },
    ],
  },
  faq: {
    title: 'FAQs',
    intro: 'Common questions about creating and managing jobs in Novara.',
    items: [
      { q: 'How do I create a new job post?', a: 'Open Jobs and choose Create New Job Post. Three steps (job details, hiring funnel and review) take you to a live post.' },
      { q: 'Can AI write the job description for me?', a: 'Yes. After you fill in the basic requirements, choose Generate description with AI. You can edit the draft or write your own instead.' },
      { q: 'Can I save a job as a draft?', a: 'Yes. Save as draft on the review step keeps everything you entered, and the job appears under Draft jobs until you publish it.' },
      { q: 'What is the hiring funnel?', a: 'It is the set of stages each applicant moves through for that role, from the AI interview to offered or rejected. You can add your own stages in between.' },
      { q: 'How do candidates book their interview?', a: 'Choose an access mode per job: send invitations manually, assign the earliest slot automatically, or let candidates pick any open slot.' },
      { q: 'What happens when a job reaches its deadline?', a: 'The job moves to Expired and stops accepting applications. Its candidates and results stay available for review.' },
    ],
  },
  close: {
    title: 'Find Best-Fit Candidates with Novara AI Resume Screening',
    text: 'Every resume is scored against your role the moment it arrives, so your shortlist is ready before you open the inbox.',
    cta: { label: 'Book Demo', href: DEMO_HREF },
  },
};
