/**
 * Platform views. Layouts, labels, columns and chip styles follow the real Novara dashboard
 * (design/reference). Every name, email and figure here is fictional.
 */
import { lead } from './demo';

export const appDate = 'Thursday October 29, 2026';
export const appUser = { name: 'Priya Nair', initials: 'PN', role: 'Org Admin' } as const;

export const dashStats = [
  { label: 'Active Jobs', value: '04', icon: 'briefcase', tone: 'success' },
  { label: 'Candidates in Pipeline', value: '12', icon: 'users', tone: 'gray' },
  { label: 'Offers Pending', value: '02', icon: 'hourglass', tone: 'warning' },
  { label: 'Upcoming Interviews', value: '06', icon: 'calendar', tone: 'gray' },
] as const;

export const todo = {
  count: 3,
  rows: [
    { lead: '3 reviews pending', job: 'Product Designer', icon: 'file', tone: 'blue' },
    { lead: '3 AI Interview requests pending', job: 'Backend Engineer (Node.js)', icon: 'hourglass', tone: 'warning' },
    { lead: '2 offers pending', job: 'Frontend Engineer', icon: 'hourglass', tone: 'warning' },
  ],
} as const;

export const jobsChart = {
  max: 500,
  ticks: [500, 400, 300, 200, 100],
  legend: [
    { key: 'applied', label: 'Applied', cls: 'bg-primary-300' },
    { key: 'ai', label: 'AI Interview', cls: 'bg-warning/40' },
    { key: 'next', label: 'Next Stages', cls: 'bg-blue-light/40' },
    { key: 'offered', label: 'Offered', cls: 'bg-success/40' },
  ],
  jobs: [
    { label: 'Product Designer', vals: [210, 70, 40, 15] },
    { label: 'Frontend Engineer', vals: [250, 90, 60, 25] },
    { label: 'Backend Engineer', vals: [170, 80, 45, 20] },
    { label: 'QA Engineer', vals: [130, 55, 30, 10] },
  ],
} as const;

export const activity = [
  { ago: '19 minutes ago', who: 'Daniel Cho', text: 'accepted 3 new AI Interview requests for', job: 'Frontend Engineer' },
  { ago: '30 minutes ago', who: 'Sofia Lindqvist', text: 'moved 5 new candidates to the next stage (HR Round) for', job: 'Backend Engineer (Node.js)' },
  { ago: '50 minutes ago', who: 'Sofia Lindqvist', text: 'added feedback for 3 candidates in the (Completed) stage for', job: 'Product Designer' },
  { ago: '1 hour ago', who: 'Priya Nair', text: 'published', job: 'QA Engineer' },
] as const;

export const jobsList = {
  stats: [
    { label: 'Total jobs', value: '8', icon: 'briefcase', tone: 'blue' },
    { label: 'Active jobs', value: '6', icon: 'briefcase', tone: 'success' },
    { label: 'Draft jobs', value: '1', icon: 'file', tone: 'warning' },
    { label: 'Expired jobs', value: '1', icon: 'clock', tone: 'gray' },
  ],
  rows: [
    { title: 'Backend Engineer (Node.js)', deadline: '20 November 2026', applicants: 38, shortlisted: '-', interview: '04', offered: '00', status: 'Active' },
    { title: 'Frontend Engineer (React)', deadline: '20 November 2026', applicants: 24, shortlisted: '-', interview: '02', offered: '00', status: 'Active' },
    { title: 'Product Designer', deadline: '30 November 2026', applicants: 12, shortlisted: '3', interview: '08', offered: '01', status: 'Active' },
    { title: 'DevOps Engineer', deadline: '30 November 2026', applicants: 15, shortlisted: '-', interview: '00', offered: '00', status: 'Active' },
    { title: 'QA Engineer', deadline: '30 November 2026', applicants: 9, shortlisted: '-', interview: '00', offered: '00', status: 'Active' },
    { title: 'Data Analyst Intern', deadline: '12 October 2026', applicants: 41, shortlisted: '6', interview: '22', offered: '02', status: 'Expired' },
  ],
} as const;

export const profile = {
  initials: lead.initials,
  name: lead.name,
  email: 'amara.okafor@example.com',
  skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'REST', 'Docker', '+5'],
  history: [
    { role: 'Backend Engineer (Node.js)', deadline: 'Deadline: 20 November 2026', live: true, applied: '12 Oct 26', fit: 92, ai: 88, stage: 'AI Interview', state: 'Completed' },
    { role: 'Platform Engineer', deadline: 'Deadline: 03 November 2026', live: true, applied: '12 Oct 26', fit: 84, ai: 0, stage: 'AI Interview', state: 'Scheduled' },
    { role: 'API Developer', deadline: 'Deadline: 03 November 2026', live: true, applied: '12 Oct 26', fit: 80, ai: 0, stage: 'AI Interview', state: 'Pre-Scheduled' },
    { role: 'Solutions Engineer', deadline: 'Deadline: 15 October 2026', live: false, applied: '05 Oct 26', fit: 85, ai: 79, stage: 'Offered', state: '' },
    { role: 'Site Reliability Engineer', deadline: 'Deadline: 01 October 2026', live: false, applied: '28 Sep 26', fit: 68, ai: 0, stage: 'Applied', state: '' },
  ],
} as const;

export const interviewsList = {
  stats: [
    { label: 'Completed Interviews', value: '22', icon: 'check', tone: 'success' },
    { label: 'Rescheduled Interviews', value: '4', icon: 'clock', tone: 'warning' },
    { label: 'Booked Interviews', value: '31', icon: 'calendar', tone: 'primary' },
    { label: 'Expired Interviews', value: '9', icon: 'clock', tone: 'gray' },
  ],
  rows: [
    { name: 'Tomas Reyes', email: 'tomas.reyes@example.com', job: 'Backend Engineer', date: '21 Oct 2026', time: '11:45 AM', status: 'Expired' },
    { name: 'Hana Kobayashi', email: 'hana.kobayashi@example.com', job: 'Backend Engineer', date: '21 Oct 2026', time: '10:45 AM', status: 'Completed' },
    { name: 'Omar Haddad', email: 'omar.haddad@example.com', job: 'Product Designer', date: '22 Oct 2026', time: '10:15 AM', status: 'Completed' },
    { name: 'Lena Fischer', email: 'lena.fischer@example.com', job: 'Product Designer', date: '22 Oct 2026', time: '04:45 PM', status: 'Booked' },
    { name: 'Ravi Menon', email: 'ravi.menon@example.com', job: 'Frontend Engineer', date: '23 Oct 2026', time: '09:45 AM', status: 'Booked' },
    { name: 'Chloe Martin', email: 'chloe.martin@example.com', job: 'Frontend Engineer', date: '23 Oct 2026', time: '06:15 PM', status: 'Expired' },
  ],
} as const;

export const careerWidget = {
  tag: 'SOFTWARE DEVELOPMENT ENGINEERING',
  location: 'Remote',
  open: 9,
  jobs: [
    { title: 'Backend Engineer (Node.js)', deadline: 'Nov 20, 2026' },
    { title: 'Frontend Engineer (React)', deadline: 'Nov 20, 2026' },
    { title: 'DevOps Engineer', deadline: 'Nov 30, 2026' },
  ],
} as const;

export const analyticsView = {
  stats: [
    { label: 'Active Jobs', value: '6' },
    { label: 'Total Candidates', value: '98' },
    { label: 'Qualified Candidates', value: '61' },
    { label: 'AI Interviews', value: '47' },
  ],
  fit: { average: 78, strong: 27, total: 98 },
  interviews: [
    { label: 'Scheduled', value: 41 },
    { label: 'Completed', value: 27 },
    { label: 'Rescheduled', value: 6 },
    { label: 'No-show', value: 4 },
  ],
} as const;
