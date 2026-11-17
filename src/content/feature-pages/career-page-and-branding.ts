import type { FeaturePageContent } from './types';
import { DEMO_HREF, demoAndExplore, featureShot } from './shared';

const img = (name: string, alt: string, width: number, height: number) => featureShot('career-page-and-branding', name, alt, width, height);

export const careerPageAndBranding: FeaturePageContent = {
  seo: {
    title: 'Career Page Builder and Recruitment Branding | Novara',
    description:
      'Build a branded career page, embed it on your website, share direct job links and send on-brand recruitment emails with editable templates in Novara.',
  },
  hero: {
    title: 'A Career Pages Builder That Serves Your Brand',
    text: 'Create a company career page, share job openings through application links, and manage candidate invitations with customizable email templates. Bring your recruitment touchpoints together with Novara.',
    ctas: demoAndExplore('#branded-career-page'),
    visual: img('career-page', 'Company career page listing open positions by department, each with an Apply Now button', 1064, 1056),
  },
  groups: [
    {
      id: 'branded-career-page',
      rows: [
        {
          title: 'Create a Branded Career Page for Your Company',
          text: "Build a company career page using Novara's career page feature and manage its branding and settings to present job opportunities to potential applicants.",
          side: 'left',
          visual: img('branded-career-page', 'Branded company career page on desktop and mobile with an intro, team photos and open positions', 1490, 1096),
        },
      ],
    },
    {
      id: 'embed-career-page',
      rows: [
        {
          title: 'Embed Your Career Page into Your Company Website',
          text: "Use Novara's career page embed code to display recruitment opportunities on your company's existing website and connect visitors with your job application flow.",
          side: 'right',
          visual: img('embed-code', 'Career page settings with the embed code to copy and a preview of open positions on a company website', 1148, 1022),
        },
      ],
    },
    {
      id: 'job-links',
      rows: [
        {
          title: 'Share Job Openings with Direct Application Links',
          text: 'Copy and share job links to help candidates access specific job opportunities and enter the application process.',
          side: 'left',
          visual: img('share-job-link', 'Share position dialog with a copyable application link, an application email address and social sharing buttons', 1528, 1148),
        },
      ],
    },
    {
      id: 'email-templates',
      rows: [
        {
          title: 'Customize Recruitment Emails with Editable Templates',
          text: 'Manage recruitment communication using editable email templates with variables. Update template content and restore the default version when needed.',
          side: 'right',
          visual: img('email-template', 'Email template editor with sender, subject and a placeholder menu for candidate and company variables', 1600, 1194),
        },
      ],
    },
    {
      id: 'email-invitations',
      rows: [
        {
          title: 'Manage Candidate and Team Invitations Through Email',
          text: "Use Novara's email invitation functionality to support candidate and user invitations within the recruitment platform.",
          side: 'left',
          visual: img('invitation-email', 'Edit invitation email with the email content beside a live preview of what the candidate receives', 1600, 1197),
        },
      ],
    },
    {
      id: 'connected-touchpoints',
      rows: [
        {
          title: 'Connect Your Career Page, Job Links, and Recruitment Emails',
          text: 'Bring together your company career page, shared job application links, and editable invitation templates to create a more connected recruitment experience.',
          ctas: demoAndExplore('#how-it-works'),
          side: 'right',
          visual: img('connected-touchpoints', 'Branded career pages with open positions, connected to job boards like LinkedIn, Google and Indeed', 1600, 1200),
        },
      ],
    },
  ],
  how: {
    title: 'How Novara Career Page and Branding Features Work?',
    intro: 'Four steps take you from a branded career page to candidates in your inbox.',
    steps: [
      { title: 'Set Up Career Page', text: 'Configure your company career page and branding.' },
      { title: 'Embed Career Page', text: 'Use the embed code on your company website.' },
      { title: 'Share Job Links', text: 'Copy and distribute job application links.' },
      { title: 'Manage Invitations', text: 'Customize email templates and manage invitations.' },
    ],
  },
  why: {
    title: 'Why Choose Novara for Career Page and Recruitment Branding?',
    text: 'Every touchpoint a candidate sees should look and sound like your company. Novara keeps your page, links and emails consistent.',
    cta: { label: 'Book Now', href: DEMO_HREF },
    reasons: [
      { icon: 'palette', title: 'Your brand, front and centre', text: 'Set your logo, colours and content so the page feels like your company.' },
      { icon: 'code', title: 'Embed in minutes', text: 'One snippet puts live job openings on your existing website.' },
      { icon: 'link', title: 'Links that go straight to apply', text: 'Every job gets a direct link candidates can open from anywhere.' },
      { icon: 'mail', title: 'Emails in your voice', text: 'Editable templates with variables, and a one-click restore to default.' },
      { icon: 'users', title: 'Invitations for everyone', text: 'Invite candidates and teammates from the same place.' },
      { icon: 'layers', title: 'Connected touchpoints', text: 'Career page, job links and emails all work together.' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      { q: 'Can I create a career page without a developer?', a: "Yes. Set up your career page and its branding from Novara's settings, with no code needed." },
      { q: 'How do I add the career page to my website?', a: 'Copy the embed code from your career page settings and paste it into your website. Your open jobs appear there automatically.' },
      { q: 'How do I share a single job opening?', a: "Copy the job's direct application link and share it anywhere: job boards, social media, email or messaging apps." },
      { q: 'Can I edit recruitment email templates?', a: "Yes. Edit any template, use variables like the candidate's name, and restore the default version whenever you need to." },
      { q: 'Can I invite team members by email?', a: 'Yes. Novara sends email invitations to both candidates and users on your team.' },
    ],
  },
  close: {
    title: 'Create a Branded Recruitment Experience with Novara',
    text: 'Launch a career page, share jobs anywhere and send on-brand emails from one platform.',
    cta: { label: 'Book Now', href: DEMO_HREF },
  },
};
