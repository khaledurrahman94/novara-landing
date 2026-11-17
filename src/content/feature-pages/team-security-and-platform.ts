import { ONBOARDING_HREF, SIGN_IN_HREF } from '../home';
import type { Cta, FeaturePageContent } from './types';
import { DEMO_HREF, featureShot } from './shared';

const img = (name: string, alt: string, width: number, height: number) => featureShot('team-security-and-platform', name, alt, width, height);
const explore = (href: string): Cta => ({ label: 'Explore Platform Features', href, variant: 'secondary' });

export const teamSecurityAndPlatform: FeaturePageContent = {
  seo: {
    title: 'Recruitment Team, Access and Platform Management | Novara',
    description:
      'Manage your recruitment team, role-based permissions, company-isolated data, AI provider settings and employer accounts from one secure Novara platform.',
  },
  hero: {
    title: 'Secure AI Recruitment Platform with Team and Access Controls',
    text: "Manage your recruitment team, control user permissions, keep company recruitment data isolated, and configure your preferred AI provider—all from Novara's centralized platform.",
    ctas: [{ label: 'Book a Demo', href: DEMO_HREF }, explore('#company-settings')],
    visual: img('hiring-team-roles', 'Hiring team and roles setup with a hiring manager, interview panel, collaboration group and job-level permissions', 1204, 1180),
  },
  groups: [
    {
      id: 'company-settings',
      rows: [
        {
          title: 'Manage Company Profiles and Recruitment Settings in One Place',
          text: 'Create and manage your company profile, configure organization settings, and use duplicate company-name validation to support consistent company registration.',
          side: 'left',
          visual: img('company-settings', 'Organization settings with profile, organization, team management, users and billing', 1576, 1240),
        },
      ],
    },
    {
      id: 'team-management',
      rows: [
        {
          title: 'Invite and Manage Your Recruitment Team from One Dashboard',
          text: 'Invite team members, view and manage users, and assign appropriate roles. Novara supports invitation links that expire after seven days and can be resent when necessary.',
          side: 'right',
          visual: img('user-management', "Users list showing a pending invitation, last seen times and each member's team and role", 1560, 1212),
        },
      ],
    },
    {
      id: 'role-permissions',
      rows: [
        {
          title: 'Control Recruitment Platform Access with Role-Based Permissions',
          text: 'Assign Admin, HR Manager, and Recruiter roles with module-level access permissions to manage what different team members can access within the platform.',
          side: 'left',
          visual: img('permission-matrix', 'Role permission matrix with modules down the side and Admin, HR Manager and Recruiter across the top', 1148, 730),
        },
      ],
    },
    {
      id: 'data-isolation',
      rows: [
        {
          title: "Keep Each Company's Recruitment Data Isolated",
          text: "Novara's multi-tenant architecture isolates company-specific users, jobs, candidates, resumes, interviews, reports, and configuration data.",
          side: 'right',
          visual: img('data-isolation', 'The Novara platform above three companies, each with its own locked users, jobs, candidates, resumes, interviews, reports and settings', 1148, 870),
        },
      ],
    },
    {
      id: 'file-storage',
      rows: [
        {
          badge: 'Coming soon',
          title: 'Organize Recruitment Files with Company-Specific Storage',
          text: 'Novara is developing separate client-wise storage for resumes, interview recordings, reports, and recruitment files.',
          side: 'left',
          visual: img('file-storage', 'File storage with a usage overview, folders, recent files and a list of all files', 1498, 934),
        },
      ],
    },
    {
      id: 'ai-configuration',
      rows: [
        {
          title: 'Configure Your Preferred AI Provider and Model',
          text: "Use Novara's default AI configuration or configure your own AI provider, API key, and model through the platform settings.",
          ctas: [explore('#how-it-works')],
          side: 'right',
          visual: img('ai-providers', 'AI providers settings listing OpenAI, Anthropic, Mistral, xAI and Perplexity with models and connection status', 1568, 1212),
        },
      ],
    },
    {
      id: 'employer-accounts',
      rows: [
        {
          title: 'Manage Employer Registration and Account Login',
          text: 'Novara provides employer registration and login functionality, allowing authorized company users to access the recruitment platform.',
          ctas: [
            { label: 'Sign In', href: SIGN_IN_HREF },
            { label: 'Sign up', href: ONBOARDING_HREF, variant: 'secondary' },
          ],
          side: 'left',
          visual: img('employer-login', 'Novara employer login with work email, password and a link to register a company', 1148, 1392),
        },
      ],
    },
    {
      id: 'platform-admin',
      rows: [
        {
          title: 'Manage Platform Administration from One Central Dashboard',
          text: "Use Novara's admin panel to manage companies, users, roles, permissions, master data, interviews, and platform configuration.",
          side: 'right',
          visual: img('admin-roles', 'User roles and permissions panel with role cards such as Hiring Manager, People Manager and Viewer', 1040, 1204),
        },
      ],
    },
  ],
  how: {
    title: 'How Novara Team, Security and Platform Management Works',
    intro: 'Four steps take you from a new company account to a secure, fully configured platform.',
    steps: [
      { title: 'Create Company', text: 'Register your employer account and configure company settings.' },
      { title: 'Invite Team', text: 'Add users and assign recruitment roles.' },
      { title: 'Configure Access', text: 'Manage module-level permissions and AI settings.' },
      { title: 'Manage Platform', text: 'Use the admin panel with company-isolated recruitment data.' },
    ],
  },
  why: {
    title: 'Why Choose Novara for Recruitment Team and Platform Management?',
    text: 'Your team, your data and your AI settings, under your control. Novara keeps access clear and company data separate.',
    cta: { label: 'Book Now', href: DEMO_HREF },
    reasons: [
      { icon: 'users', title: 'Your whole team in one place', text: 'Invite, manage and remove users from a single dashboard.' },
      { icon: 'key', title: 'Access that fits each role', text: 'Module-level permissions for Admin, HR Manager and Recruiter.' },
      { icon: 'shield', title: 'Company data kept separate', text: "Multi-tenant isolation keeps each company's data to itself." },
      { icon: 'cpu', title: 'Your choice of AI', text: "Use Novara's default AI or bring your own provider, key and model." },
      { icon: 'building', title: 'Clean company records', text: 'Company profiles with duplicate-name checks at registration.' },
      { icon: 'grid', title: 'One central admin panel', text: 'Companies, users, master data and interviews in one view.' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      { q: 'How do I invite team members?', a: 'Invite users by email from the users dashboard and assign their role. Invitation links expire after seven days and can be resent.' },
      { q: 'What roles does Novara support?', a: 'Novara includes Admin, HR Manager and Recruiter roles, each with module-level access permissions.' },
      { q: 'Is our recruitment data kept separate from other companies?', a: "Yes. Novara's multi-tenant architecture isolates each company's users, jobs, candidates, resumes, interviews, reports and configuration." },
      { q: 'Can we use our own AI provider?', a: "Yes. Use Novara's default AI configuration, or add your own provider, API key and model in the platform settings." },
      { q: 'What happens if two companies register with the same name?', a: 'Novara checks for duplicate company names during registration to keep company records consistent.' },
    ],
  },
  close: {
    title: 'Manage Your Recruitment Team, Data and AI from One Platform',
    text: 'Invite your team, control access and choose your AI, all in one secure workspace.',
    cta: { label: 'Book Demo', href: DEMO_HREF },
  },
};
