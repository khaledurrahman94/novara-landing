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
  { key: 'camera', label: 'Camera off', title: 'Camera off', icon: 'video-off' },
  { key: 'faces', label: 'Second face', title: 'Second face', icon: 'users' },
] as const;

export const lab = {
  id: 'interview-lab',
  title: 'Try to cheat. Novara will notice.',
  sub: "A live demo of what Novara's integrity monitor sees during a real interview. Switch tabs, click away, copy the question or move your cursor out of the window. Nothing you do here is recorded or sent anywhere.",
  frameLabel: 'Interactive AI interview demo',
  intro: "Hi, I'm Novara's AI interviewer. Let's begin.",
  cue: 'Scroll to start the interview',
  questions: [
    'Walk me through how you would split a monolith into services.',
    'Tell me about an API you changed without breaking the teams that used it.',
    'A report query gets slow after a launch. What do you check first?',
  ],
  step: (n: number, total: number): string => `Question ${n} of ${total}`,
  next: 'Next question',
  finish: 'Finish interview',
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
    receivedAnnounce: (n: number): string => `Answer ${n} received and transcribed.`,
  },
  team: {
    label: "Your team's view",
    note: 'Only your hiring team sees this',
    app: 'Novara',
    live: 'Live',
    hint: 'Try it: switch tabs or copy the question.',
  },
  answers: [
    "I'd start with the seams: parts that change independently, like billing or notifications. Pull one out behind an API, keep the database shared at first, and move its data last.",
    'We added a new field and kept the old one for two releases. I told each consuming team early, tracked who still read the old field, and only removed it once the logs showed no traffic.',
    'I look at the query plan first, then at what changed in the launch: new filters, a missing index or a lot more rows. I fix the slowest step and measure again before touching anything else.',
  ],
  panelTitle: 'Integrity monitor',
  review: (n: number): string => (n === 1 ? '1 event to review' : `${n} events to review`),
  simulateTitle: 'Simulate',
  simulateNote: 'No camera is used. These are switches, not detection.',
  simCamera: 'Camera off',
  simFaces: 'Second face',
  simFullscreen: 'Left full screen',
  simTag: 'Simulated',
  cursorTag: 'Cursor stand-in',
  empty: 'Nothing flagged yet.',
  eyes: 'In this demo your cursor stands in for your eyes. Keep it inside the window.',
  earlier: (n: number): string => (n === 1 ? '1 earlier event, in your report' : `${n} earlier events, in your report`),
  started: 'Interview started',
  ended: 'Interview ended',
  flagged: 'Flagged for your review',
  pasted: 'Pasted text',
  toast: 'Flagged for review',
  announce: (text: string, n: number): string => `Flagged for review: ${text}. ${n === 1 ? '1 event' : `${n} events`} so far.`,
  overlay: { cameraSelf: 'Camera off' },
  report: {
    title: 'Your integrity report',
    sampleTitle: 'A sample integrity report',
    summary: (n: number): string => (n === 1 ? '1 event flagged for review.' : `${n} events flagged for review.`),
    clean: 'No events this time. Try again and misbehave.',
    line: "Events are flagged for your team to review. Novara doesn't reject anyone for them.",
    again: 'Try again',
    sampleNote: 'This is a sample. The interactive demo needs JavaScript.',
  },
  score: {
    chip: 'Sample scoring',
    note: "Illustrative. Novara scores a real candidate's spoken answers. Nothing from this demo is scored.",
  },
} as const;

/** mm:ss from milliseconds. */
export const clock = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** Short duration for event details: 4s, 1m 05s. */
export const span = (ms: number): string => {
  const s = Math.max(1, Math.round(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
};
