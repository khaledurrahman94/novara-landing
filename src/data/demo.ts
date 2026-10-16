/**
 * Illustrative demo data shared by V1 and V2. One cast, one story.
 * Names and profiles are fictional. `round` is from one real hiring round.
 */

export type StageName =
  | 'Applied'
  | 'AI Request'
  | 'Prescheduled'
  | 'Scheduled'
  | 'Completed'
  | 'HR Round'
  | 'Offered'
  | 'Rejected';

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  fit: number;
  stage: StageName;
  /** Short line shown under the name in lists. */
  note: string;
  fitLabel: 'Qualified' | 'Not a fit';
}

export const role = {
  title: 'Backend Engineer (Node.js)',
  short: 'Backend Engineer',
  location: 'Remote',
  level: 'Senior',
  type: 'Full time',
  skills: ['Node.js', 'TypeScript', 'PostgreSQL'],
} as const;

export const recruiter = { name: 'Priya Nair', first: 'Priya', initials: 'PN', title: 'Recruiter' } as const;

export const candidates: Candidate[] = [
  { id: 'amara', name: 'Amara Okafor', initials: 'AO', fit: 92, stage: 'HR Round', note: '6 yrs Node.js and TypeScript', fitLabel: 'Qualified' },
  { id: 'ines', name: 'Ines Duarte', initials: 'ID', fit: 84, stage: 'Completed', note: 'PostgreSQL, event-driven systems', fitLabel: 'Qualified' },
  { id: 'leo', name: 'Leo Park', initials: 'LP', fit: 81, stage: 'AI Request', note: 'Node.js, payments APIs', fitLabel: 'Qualified' },
  { id: 'kenji', name: 'Kenji Sato', initials: 'KS', fit: 79, stage: 'HR Round', note: 'TypeScript, service design', fitLabel: 'Qualified' },
  { id: 'marcus', name: 'Marcus Webb', initials: 'MW', fit: 76, stage: 'Scheduled', note: 'Node.js, REST and queues', fitLabel: 'Qualified' },
  { id: 'nadia', name: 'Nadia Rahman', initials: 'NR', fit: 58, stage: 'Applied', note: 'Missing 3 required skills', fitLabel: 'Not a fit' },
];

export const byId = (id: string): Candidate => {
  const c = candidates.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown demo candidate: ${id}`);
  return c;
};

export const lead = byId('amara');

export const fit = {
  score: 92,
  matched: ['6 yrs Node.js and TypeScript', 'PostgreSQL at scale', 'Led an API migration'],
  missing: [{ label: 'Kubernetes', note: 'nice to have' }],
  reasoning:
    'Six years of Node.js and TypeScript cover the core of the role. PostgreSQL at scale and the API migration she led map to the job’s data and delivery work. Kubernetes is the one gap, and the job lists it as nice to have.',
} as const;

export const interview = {
  score: 88,
  questions: [
    { label: 'Technical depth', score: 9 },
    { label: 'Problem solving', score: 8 },
    { label: 'Communication', score: 9 },
  ],
  duration: '24:36',
  /** Timer shown on the live frame. */
  liveTimer: '10:42',
  captions: [
    'Walk me through how you would split a monolith into services.',
    'I would start with the billing boundary, because it changes least.',
  ],
} as const;

export const integrity = {
  counters: [
    { key: 'tab', label: 'Tab switches', value: 0, icon: 'window' },
    { key: 'focus', label: 'Focus lost', value: 1, icon: 'scan' },
    { key: 'paste', label: 'Copy and paste', value: 0, icon: 'clipboard' },
    { key: 'faces', label: 'Multiple faces', value: 0, icon: 'users' },
  ],
  events: [
    { time: '00:00', label: 'Interview started', flagged: false },
    { time: '10:42', label: 'Focus lost for 3s', flagged: true },
    { time: '24:36', label: 'Interview ended', flagged: false },
  ],
  toReview: 1,
} as const;

export const jobDraft = {
  title: role.title,
  level: role.level,
  location: role.location,
  skills: role.skills,
  lines: [
    'Build and run the APIs behind our hiring platform.',
    'Own services end to end, from design to production.',
    'Work with PostgreSQL at scale and keep it fast.',
    'Review code, mentor teammates and improve our tooling.',
  ],
} as const;

export const slots = {
  days: [
    { key: 'tue', label: 'Tue', date: '20 Oct' },
    { key: 'wed', label: 'Wed', date: '21 Oct' },
    { key: 'thu', label: 'Thu', date: '22 Oct' },
  ],
  times: ['09:30', '10:30', '14:00', '16:30'],
  selected: { day: 'wed', time: '10:30' },
  toast: 'Interview booked for Wed 21 Oct, 10:30',
} as const;

export const careerJobs = [
  { title: 'Backend Engineer (Node.js)', meta: 'Remote', type: 'Full time' },
  { title: 'Frontend Engineer (React)', meta: 'Remote', type: 'Full time' },
  { title: 'DevOps Engineer', meta: 'Hybrid', type: 'Full time' },
] as const;

export const embed = [
  '<div class="novara-careers" data-company-slug="your-company"></div>',
  '<script src="https://…/careerbridge/latest/widget.js" async></script>',
] as const;

/** One real hiring round for engineering roles. */
export const round = { applied: '1,200+', interviewed: 600, shortlisted: 12, hired: 4 } as const;

export const roundBars = [
  { key: 'applied', label: 'Applied', display: '1,200+', value: 1200 },
  { key: 'interviewed', label: 'AI interviews', display: '600', value: 600 },
  { key: 'shortlisted', label: 'Shortlisted', display: '12', value: 12 },
  { key: 'hired', label: 'Hired', display: '4', value: 4 },
] as const;

export const boardColumns: { stage: StageName; ids: string[] }[] = [
  { stage: 'AI Request', ids: ['leo'] },
  { stage: 'Scheduled', ids: ['marcus'] },
  { stage: 'Completed', ids: ['ines'] },
  { stage: 'HR Round', ids: ['amara', 'kenji'] },
];

export const pipelineStatus = 'Moved to HR Round by Priya';

/** Illustrative candidates-by-stage counts for the analytics view (product UI only). */
export const stageCounts: { stage: StageName; count: number }[] = [
  { stage: 'Applied', count: 48 },
  { stage: 'AI Request', count: 31 },
  { stage: 'Prescheduled', count: 22 },
  { stage: 'Scheduled', count: 17 },
  { stage: 'Completed', count: 12 },
  { stage: 'HR Round', count: 5 },
];
