import type { FeaturePageContent } from './types';
import { DEMO_HREF, demoAndExplore, featureShot } from './shared';

const img = (name: string, alt: string, width: number, height: number) => featureShot('interview-dashboard', name, alt, width, height);

export const interviewDashboard: FeaturePageContent = {
  seo: {
    title: 'Interview Scheduling Software | Novara',
    description:
      'Manage interview requests, set time slots, let candidates pick a time and track every scheduled interview across all jobs from one Novara dashboard.',
  },
  hero: {
    title: 'Interview Scheduling Software to Simplify Your Hiring Process',
    text: 'Manage interview requests, configure available time slots, let candidates choose their preferred interview times, and track scheduled interviews across all jobs from one centralized dashboard.',
    ctas: demoAndExplore('#interview-requests'),
    visual: img('interview-calendar', 'Novara Interviews week view with a mini calendar, today’s interviews and scheduled sessions for each day', 1528, 962),
  },
  groups: [
    {
      id: 'interview-requests',
      rows: [
        {
          title: 'Manage Candidate Interview Scheduling Requests in One Place',
          text: 'Request and preschedule candidate interviews within Novara to organize the interview scheduling process from the recruitment platform.',
          side: 'left',
          visual: img('interview-requests', 'Interview requests list with times and statuses, and a menu to edit the event, create a new link or cancel', 1310, 800),
        },
      ],
    },
    {
      id: 'time-slots',
      rows: [
        {
          title: 'Configure Interview Time Slots for Candidate Scheduling',
          text: 'Set up interview time slots and allow candidates to select from the available options, making the scheduling process easier for recruiters and applicants.',
          side: 'right',
          visual: img('time-slots', 'Interview slot picker with an April calendar and a list of available times', 1600, 1197),
        },
      ],
    },
    {
      id: 'candidate-slots',
      rows: [
        {
          title: 'Let Candidates Choose Their Preferred Interview Time Slots',
          text: 'Give candidates the ability to select an interview slot from the available options configured in Novara.',
          side: 'left',
          visual: img('choose-slot', 'Candidate choosing 9:30 am on 28 April from the available interview times', 1600, 1196),
        },
      ],
    },
    {
      id: 'rescheduling',
      rows: [
        {
          title: 'Reschedule Candidate Interviews Without Losing Previous Records',
          text: 'Manage interview rescheduling while keeping the previous scheduling record, helping recruiters maintain visibility into changes made to interview appointments.',
          side: 'left',
          visual: img('reschedule', 'Rescheduling an interview: a date and time picker with planned interviews and the history of earlier interview times', 1556, 1120),
        },
      ],
    },
    {
      id: 'all-jobs',
      rows: [
        {
          title: 'Track Scheduled Interviews Across All Jobs from One Dashboard',
          text: 'View scheduled interviews and interview slots across all jobs from a centralized dashboard. Filter interviews by date and status to find relevant scheduling information.',
          side: 'left',
          visual: img('all-jobs-calendar', 'Interview calendar for April with job filters and interviews for every open role', 1148, 1014),
        },
      ],
    },
    {
      id: 'schedule-filters',
      rows: [
        {
          title: 'Organize Interview Schedules with Date and Status Filters',
          text: 'Find and review scheduled interviews using date and status filters, helping recruitment teams manage interview activities across different job openings.',
          ctas: demoAndExplore('#how-it-works'),
          side: 'left',
          visual: img('interview-list', 'Interview scheduler list showing candidates, roles, interview stage, date and time, interviewers and mode', 1396, 1220),
        },
      ],
    },
  ],
  how: {
    title: 'How Novara Interview Scheduling Software Works?',
    intro: "Four steps take an interview from first request to a confirmed slot on everyone's calendar.",
    steps: [
      { title: 'Request Interview', text: 'Initiate or preschedule a candidate interview.' },
      { title: 'Configure Slots', text: 'Set available interview time slots.' },
      { title: 'Candidate Selects', text: 'Candidate chooses an available interview slot.' },
      { title: 'Manage Schedule', text: 'View, filter, and reschedule interviews from the dashboard.' },
    ],
  },
  why: {
    title: 'Why Choose Novara for Interview Scheduling and Management?',
    text: 'Stop chasing replies to find a time. Set your slots once, let candidates book, and see every interview across every job in one place.',
    cta: { label: 'Book Now', href: DEMO_HREF },
    reasons: [
      { icon: 'clock', title: 'No more back-and-forth', text: 'Candidates pick from your open slots instead of trading emails to find a time.' },
      { icon: 'calendar', title: 'Slots you control', text: 'Choose the days, hours and slot length that work for your team.' },
      { icon: 'history', title: 'Every change on record', text: 'Rescheduled interviews keep their history, so nothing gets lost.' },
      { icon: 'layers', title: 'All jobs, one dashboard', text: 'See interviews for every open role in one calendar and one list.' },
      { icon: 'filter', title: 'Find any interview fast', text: 'Filter by date and status to get straight to what you need.' },
      { icon: 'users', title: 'Built for the whole team', text: 'Recruiters and hiring managers work from the same schedule.' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      { q: 'How do candidates book an interview?', a: 'You set the available time slots for a job, and candidates pick the slot that suits them from those options.' },
      { q: 'Can I preschedule an interview for a candidate?', a: 'Yes. You can request or preschedule an interview from Novara before the candidate confirms a time.' },
      { q: 'What happens to the old time when an interview is rescheduled?', a: 'The previous time stays in the interview’s history, so you can always see what changed and when.' },
      { q: 'Can I see interviews for every job in one place?', a: 'Yes. The interview dashboard shows scheduled interviews across all jobs, with filters for date and status.' },
    ],
  },
  close: {
    title: 'Simplify Interview Scheduling with Novara',
    text: 'Open your slots, let candidates book, and keep every interview, change and record in one dashboard.',
    cta: { label: 'Book Demo', href: DEMO_HREF },
  },
};
