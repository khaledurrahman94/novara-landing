import type { FeaturePageContent } from './types';
import { jobCreationAndManagement } from './job-creation-and-management';

export type { FeaturePageContent } from './types';

export const featurePages: Partial<Record<string, FeaturePageContent>> = {
  'job-creation-and-management': jobCreationAndManagement,
};
