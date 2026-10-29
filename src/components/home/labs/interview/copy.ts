/** InterviewLab copy and fixed data. Page copy lives here, not in components. */

export type Kind = 'tab' | 'focus' | 'copy' | 'fullscreen' | 'away' | 'camera' | 'faces';

export interface KindMeta {
  key: Kind;
  /** Counter label. */
  label: string;
  /** Event title in the timeline and toast. */
  title: string;
  icon: string;
}

export const kinds: readonly KindMeta[] = [
  { key: 'tab', label: 'Tab switches', title: 'Tab switched', icon: 'window' },
  { key: 'focus', label: 'Focus lost', title: 'Focus lost', icon: 'scan' },
  { key: 'copy', label: 'Copy / paste', title: 'Copied the question', icon: 'copy' },
  { key: 'fullscreen', label: 'Left full screen', title: 'Left full screen', icon: 'maximize' },
  { key: 'away', label: 'Looking away', title: 'Looking away', icon: 'eye-off' },
  { key: 'camera', label: 'Camera off', title: 'Camera off or no face', icon: 'video-off' },
  { key: 'faces', label: 'Multiple faces', title: 'Multiple faces detected', icon: 'users' },
] as const;

/** One scripted event on the walkthrough's clock. `at` is seconds from the start of the interview. */
export interface ScriptEvent {
  at: number;
  kind: Kind;
  /** Short detail shown after the title, like "4s away". */
  detail?: string;
}

/**
 * The walkthrough is a scripted replay: nothing in it is detected from the visitor. Each question runs
 * `questionSeconds`, the events tick up on this timeline, and the report appears at `end`.
 */
export const script = {
  questionSeconds: 11,
  end: 34,
  events: [
    { at: 3.5, kind: 'tab', detail: '4s away' },
    { at: 7.5, kind: 'focus', detail: '3s' },
    { at: 12.5, kind: 'copy' },
    { at: 16, kind: 'camera' },
    { at: 19.5, kind: 'faces' },
    { at: 24, kind: 'fullscreen' },
    { at: 28, kind: 'away', detail: 'over 2s' },
  ] as readonly ScriptEvent[],
  /** The self-view tile shows these while the matching event is live. */
  overlays: [
    { kind: 'camera', from: 16, to: 19 },
    { kind: 'faces', from: 19.5, to: 22.5 },
  ] as readonly { kind: 'camera' | 'faces'; from: number; to: number }[],
} as const;

export const lab = {
  id: 'interview-lab',
  title: 'Cheating in an interview gets noticed.',
  sub: "A scripted walkthrough of what Novara's integrity monitor flags during a real interview: tab switches, lost focus, a copied question, the camera going off, a second face and leaving full screen. Nothing here is recorded or sent anywhere.",
  frameLabel: 'Animated AI interview demo',
  intro: "Hi, I'm Novara's AI interviewer. Let's begin.",
  cue: 'Scroll to start the interview',
  questions: [
    'Walk me through how you would split a monolith into services.',
    'Tell me about an API you changed without breaking the teams that used it.',
    'A report query gets slow after a launch. What do you check first?',
  ],
  step: (n: number, total: number): string => `Question ${n} of ${total}`,
  candidate: {
    label: "Candidate's screen",
    note: 'What the candidate sees',
    tab: 'Novara AI interview',
    listening: 'Listening',
    speaking: 'Speaking',
    transcribing: 'Transcribing',
    received: 'Answer received',
    waiting: 'Listening to the question',
    illustrative: 'Candidate answers in this demo are illustrative.',
  },
  team: {
    label: "Your team's view",
    note: 'Only your hiring team sees this',
    app: 'Novara',
    live: 'Live',
    hint: 'A scripted replay. Each event ticks up as it happens.',
    real: 'In a real interview Novara checks tab switches, focus, copy and paste, camera status, faces in view, looking away and full screen.',
  },
  answers: [
    "I'd start with the seams: parts that change independently, like billing or notifications. Pull one out behind an API, keep the database shared at first, and move its data last.",
    'We added a new field and kept the old one for two releases. I told each consuming team early, tracked who still read the old field, and only removed it once the logs showed no traffic.',
    'I look at the query plan first, then at what changed in the launch: new filters, a missing index or a lot more rows. I fix the slowest step and measure again before touching anything else.',
  ],
  panelTitle: 'Integrity monitor',
  review: (n: number): string => (n === 1 ? '1 event to review' : `${n} events to review`),
  empty: 'Nothing flagged yet.',
  earlier: (n: number): string => (n === 1 ? '1 earlier event, in the report' : `${n} earlier events, in the report`),
  started: 'Interview started',
  ended: 'Interview ended',
  flagged: 'Flagged for your review',
  toast: 'Flagged for review',
  overlay: { cameraSelf: 'Camera off' },
  report: {
    title: 'Integrity report',
    sampleTitle: 'A sample integrity report',
    summary: (n: number): string => (n === 1 ? '1 event flagged for review.' : `${n} events flagged for review.`),
    line: "Events are flagged for your team to review. Novara doesn't reject anyone for them.",
    sampleNote: 'This is a sample. The animated walkthrough needs JavaScript.',
  },
  score: {
    chip: 'Sample evaluation',
    note: "Illustrative. Novara scores a real candidate's answers out of 100 and writes the evaluation. Nothing in this demo is scored.",
  },
} as const;

/** mm:ss from milliseconds. */
export const clock = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** The title a flagged event shows in the timeline, the toast and the report. */
export const eventTitle = (e: ScriptEvent): string => {
  const base = kinds.find((k) => k.key === e.kind)?.title ?? e.kind;
  return e.detail ? `${base}, ${e.detail}` : base;
};
