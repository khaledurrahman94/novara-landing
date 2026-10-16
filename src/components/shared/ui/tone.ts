import type { StageName } from '../../../data/demo';

export type Tone = 'success' | 'warning' | 'blue' | 'primary' | 'gray';

/** One stage, one tone, everywhere. */
export const stageTone: Record<StageName, Tone> = {
  Applied: 'gray',
  'AI Request': 'blue',
  Prescheduled: 'blue',
  Scheduled: 'warning',
  Completed: 'success',
  'HR Round': 'primary',
  Offered: 'success',
  Rejected: 'gray',
};

export const toneBg: Record<Tone, string> = {
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  blue: 'bg-blue-light/10',
  primary: 'bg-primary-50',
  gray: 'bg-gray-100',
};

export const toneDot: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  blue: 'bg-blue-light',
  primary: 'bg-primary',
  gray: 'bg-gray-400',
};

/** Fit score tone: shown as tint plus dark text, so contrast stays above 4.5:1. */
export const fitTone = (score: number): Tone => (score >= 80 ? 'success' : score >= 70 ? 'primary' : 'warning');
