/** InterviewLab copy and fixed data. Page copy lives here, not in components. */

export type Kind = 'tab' | 'focus' | 'copy' | 'fullscreen' | 'away' | 'camera' | 'faces';

export interface KindMeta {
  key: Kind;
  /** Counter label. */
  label: string;
  /** Event title in the timeline and toast. */
  title: string;
  icon: string;
  /** One line under the event in the team timeline: what was seen. */
  why: string;
}

export const kinds: readonly KindMeta[] = [
  { key: 'tab', label: 'Tab switches', title: 'Tab switched', icon: 'window', why: 'The candidate left the interview tab.' },
  { key: 'focus', label: 'Focus lost', title: 'Focus lost', icon: 'scan', why: 'The interview window lost focus.' },
  { key: 'copy', label: 'Copy / paste', title: 'Copied the question', icon: 'copy', why: 'Text was copied from the question.' },
  { key: 'fullscreen', label: 'Left full screen', title: 'Left full screen', icon: 'maximize', why: 'The interview stopped being full screen.' },
  { key: 'away', label: 'Looking away', title: 'Looking away', icon: 'eye-off', why: 'Gaze left the screen (your cursor, here).' },
  { key: 'camera', label: 'Camera off', title: 'Camera off or no face', icon: 'video-off', why: 'No camera feed or no face in view.' },
  { key: 'faces', label: 'Multiple faces', title: 'Multiple faces detected', icon: 'users', why: 'More than one face was in view.' },
] as const;

export const lab = {
  id: 'interview-lab',
  title: 'Anti-Cheat Monitoring for AI Interviews',
  sub: "The strong AI interview monitoring system of Novara flags activities like candidates switch tabs, exit full-screen mode, or paste text for review. Recruiters can investigate potential interview fraud, verify candidate authenticity, and protect interview integrity before shortlisting.",
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
  pause: 'Pause',
  resume: 'Resume',
  candidate: {
    label: "Candidate's screen",
    note: 'What the candidate sees',
    tab: 'Novara AI interview',
    listening: 'Listening',
    speaking: 'Speaking',
    transcribing: 'Transcribing',
    received: 'Answer received',
    interviewer: 'Novara interviewer',
    portraitAlt: 'Novara AI interviewer, shown as an illustrated person wearing a headset',
    rec: 'REC',
    transcript: 'Interview transcript',
    you: 'You',
    showTranscript: 'Show transcript',
    hideTranscript: 'Hide transcript',
    waiting: 'Listening to the question',
    illustrative: 'Candidate answers in this demo are illustrative.',
    receivedAnnounce: (n: number): string => `Answer ${n} received and transcribed.`,
  },
  team: {
    label: "Your team's view",
    note: 'Only your hiring team sees this',
    app: 'Novara',
    live: 'Live',
    caption: 'Try it: switch tabs, copy the question or move your cursor out. Those are detected in your browser; the switches below are demo-only (no camera opens).',
  },
  answers: [
    "I'd start with the seams: parts that change independently, like billing or notifications. Pull one out behind an API, keep the database shared at first, and move its data last.",
    'We added a new field and kept the old one for two releases. I told each consuming team early, tracked who still read the old field, and only removed it once the logs showed no traffic.',
    'I look at the query plan first, then at what changed in the launch: new filters, a missing index or a lot more rows. I fix the slowest step and measure again before touching anything else.',
  ],
  panelTitle: 'Integrity monitor',
  review: (n: number): string => (n === 1 ? '1 event to review' : `${n} events to review`),
  simulateTitle: 'Simulate',
  simCamera: 'Camera off',
  simFaces: 'Multiple faces',
  simFullscreen: 'Left full screen',
  simTag: 'Simulated',
  cursorTag: 'Cursor stand-in',
  empty: 'Nothing flagged yet.',
  pastedWhy: 'Text was pasted into the interview window.',
  eventsLabel: 'Integrity events, newest first',
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
    chip: 'Sample evaluation',
    note: "Illustrative. Novara scores a real candidate's answers out of 100 and writes the evaluation. Nothing from this demo is scored.",
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
