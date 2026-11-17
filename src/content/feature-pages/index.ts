import type { FeaturePageContent } from './types';
import { aiResumeScreening } from './ai-resume-screening';
import { antiCheatMonitoring } from './anti-cheat-monitoring';
import { interviewDashboard } from './interview-dashboard';
import { jobCreationAndManagement } from './job-creation-and-management';

export type { FeaturePageContent } from './types';

export const featurePages: Partial<Record<string, FeaturePageContent>> = {
  'job-creation-and-management': jobCreationAndManagement,
  'ai-resume-screening': aiResumeScreening,
  'anti-cheat-monitoring': antiCheatMonitoring,
  'interview-dashboard': interviewDashboard,
};
