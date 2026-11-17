export type FeatureIcon = 'briefcase' | 'file' | 'mic' | 'shield' | 'grid' | 'kanban' | 'smile' | 'globe' | 'lock';

export interface Feature {
  slug: string;
  name: string;
  summary: string;
  icon: FeatureIcon;
  live: boolean;
}

export const FEATURES_BASE = '/features';
export const featurePath = (slug: string): string => `${FEATURES_BASE}/${slug}`;

export const features: Feature[] = [
  { slug: 'job-creation-and-management', name: 'Job Creation and Management', summary: 'Create, publish and manage job openings in one place.', icon: 'briefcase', live: false },
  { slug: 'ai-resume-screening', name: 'AI Resume Screening', summary: 'Score and shortlist every applicant against the role.', icon: 'file', live: false },
  { slug: 'ai-interview-and-evaluation', name: 'AI Interview and Evaluation', summary: 'Run AI interviews and get structured, rubric-based scores.', icon: 'mic', live: false },
  { slug: 'anti-cheat-monitoring', name: 'Anti-Cheat Monitoring', summary: 'Flag tab switches, focus loss and other integrity events.', icon: 'shield', live: false },
  { slug: 'interview-dashboard', name: 'Interview Dashboard', summary: 'Review recordings, scores and reports side by side.', icon: 'grid', live: false },
  { slug: 'pipeline-and-candidate-management', name: 'Pipeline and Candidate Management', summary: 'Move candidates through every stage of hiring.', icon: 'kanban', live: false },
  { slug: 'candidate-experience', name: 'Candidate Experience', summary: 'One portal for candidates to apply and track status.', icon: 'smile', live: false },
  { slug: 'career-page-and-branding', name: 'Career Page and Branding', summary: 'Branded career pages, job links and email templates.', icon: 'globe', live: false },
  { slug: 'team-security-and-platform', name: 'Team, Security and Platform', summary: 'Roles, permissions, data isolation and AI settings.', icon: 'lock', live: false },
];

export const featureMenu = {
  label: 'Features',
  heading: 'Features',
  line: 'See how Novara screens, interviews and ranks every applicant the same way.',
  demo: { label: 'Book a demo', href: '/contact' },
  back: 'Back',
  open: 'Open menu',
  close: 'Close menu',
  mobileLabel: 'Menu',
};

export const menuFeatures = (): Feature[] => features.filter((f) => f.live || import.meta.env.DEV);
