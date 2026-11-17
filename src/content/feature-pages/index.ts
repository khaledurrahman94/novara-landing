import type { FeaturePageContent } from './types';
import { aiResumeScreening } from './ai-resume-screening';
import { antiCheatMonitoring } from './anti-cheat-monitoring';
import { candidateExperience } from './candidate-experience';
import { careerPageAndBranding } from './career-page-and-branding';
import { interviewDashboard } from './interview-dashboard';
import { jobCreationAndManagement } from './job-creation-and-management';
import { teamSecurityAndPlatform } from './team-security-and-platform';

export type { FeaturePageContent } from './types';

export const featurePages: Partial<Record<string, FeaturePageContent>> = {
  'job-creation-and-management': jobCreationAndManagement,
  'ai-resume-screening': aiResumeScreening,
  'anti-cheat-monitoring': antiCheatMonitoring,
  'interview-dashboard': interviewDashboard,
  'candidate-experience': candidateExperience,
  'career-page-and-branding': careerPageAndBranding,
  'team-security-and-platform': teamSecurityAndPlatform,
};
