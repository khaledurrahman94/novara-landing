/**
 * Legal copy for /terms: Privacy Policy, Terms of Service, Terms and Conditions, Cookie Policy.
 * Code-owned for now (no CMS). The text is the DM team's draft, cleaned of drafting notes.
 *
 * Text tokens, resolved at render time by LegalText.astro:
 *   {entity}       -> `legalEntity` below, or "Novara" while it is empty
 *   {jurisdiction} -> `jurisdiction` below
 *   {email} {address} {website} -> the shared contact details in company.ts
 *
 * STILL UNKNOWN (leave empty until the DM team / legal confirms; nothing blank or bracketed ships):
 *   - `legalEntity`: the registered company that operates Novara.
 *   - `jurisdiction`: the Governing Law clauses render only when this is set.
 *   - Terms of Service and Terms and Conditions `effective` / `updated`: the date lines render only when set.
 */
import { contact } from './company';

export const legalEntity = '';
export const jurisdiction = '';

export const legalTokens = {
  entity: legalEntity || 'Novara',
  jurisdiction,
  email: contact.email,
  address: contact.address,
  website: contact.website,
} as const;

export type LegalBlock =
  | { kind: 'p'; text: string; requires?: 'jurisdiction' }
  | { kind: 'ul'; items: string[] }
  /** "Term: text" paragraphs with the term in bold. */
  | { kind: 'terms'; items: { term: string; text: string }[] }
  /** "Label: value" lines. */
  | { kind: 'lines'; items: { label: string; text: string }[] };

export interface LegalSection {
  heading: string;
  /** Heading used when every `requires` block is hidden (Terms and Conditions, "Governing Law and Contact"). */
  headingWithout?: string;
  /** Hide the whole section (heading included) until `jurisdiction` is set. */
  requires?: 'jurisdiction';
  blocks: LegalBlock[];
}

export interface LegalDocument {
  id: string;
  title: string;
  /** Empty string = not known yet, the line is not rendered. */
  effective: string;
  updated: string;
  sections: LegalSection[];
}

const p = (text: string, requires?: 'jurisdiction'): LegalBlock => ({ kind: 'p', text, ...(requires ? { requires } : {}) });
const ul = (...items: string[]): LegalBlock => ({ kind: 'ul', items });

const privacy: LegalDocument = {
  id: 'privacy-policy',
  title: 'Privacy Policy',
  effective: '29 October 2026',
  updated: '29 October 2026',
  sections: [
    {
      heading: 'Introduction',
      blocks: [
        p('This Privacy Policy explains how Novara ("Novara", "we", "us", or "our") collects, uses, stores, discloses, and protects personal information through the Novara website, application, and related services.'),
        p('Novara provides AI-powered recruitment software, including applicant tracking, resume analysis, job-fit scoring, AI interviews, and candidate evaluation.'),
        p('This Policy applies to website visitors, employer customers, authorized users, job applicants, and other individuals whose information is processed through our services.'),
      ],
    },
    {
      heading: 'Information We Collect',
      blocks: [
        p('We may collect the following categories of information:'),
        {
          kind: 'terms',
          items: [
            { term: 'Account Information', text: 'Name, email address, login credentials, organization name, and account preferences.' },
            { term: 'Candidate Information', text: 'Resumes, contact details, education, employment history, skills, qualifications, job applications, and other information submitted during recruitment.' },
            { term: 'Interview Information', text: 'Interview responses, transcripts, recordings, assessment results, and evaluation reports, where applicable.' },
            { term: 'Employer Information', text: 'Job descriptions, hiring requirements, evaluation criteria, recruitment notes, and account administration details.' },
            { term: 'Technical Information', text: 'IP address, browser type, device information, login records, usage data, and diagnostic logs.' },
            { term: 'Communications', text: 'Information provided through support requests, contact forms, and other communications with Novara.' },
          ],
        },
      ],
    },
    {
      heading: 'How We Use Information',
      blocks: [
        p('We process personal information to:'),
        ul(
          'Provide and maintain the Novara platform.',
          'Create and administer user accounts.',
          'Manage job postings and candidate applications.',
          'Analyze resumes and compare candidate profiles with job requirements.',
          'Generate AI-powered scores, explanations, interview reports, and summaries.',
          'Facilitate interview scheduling and recruitment workflows.',
          'Provide customer support and service communications.',
          'Maintain security, prevent misuse, and troubleshoot technical issues.',
          'Improve service performance in accordance with applicable law.',
          'Meet legal, regulatory, and contractual obligations.',
        ),
      ],
    },
    {
      heading: 'AI Processing',
      blocks: [
        p('Novara uses AI technologies to assist with resume analysis, job-fit scoring, interview evaluation, and related recruitment activities.'),
        p('AI-generated outputs may include scores, explanations, summaries, and recommendations based on the information provided and the features enabled.'),
        p("These outputs may contain errors or limitations and should not be treated as definitive assessments of an individual's abilities or suitability. Employers remain responsible for reviewing outputs and making recruitment decisions with appropriate human oversight."),
        p('Where third-party AI providers process information, such processing is subject to applicable contractual arrangements and privacy requirements.'),
      ],
    },
    {
      heading: 'Legal Basis for Processing',
      blocks: [
        p('Where required by applicable law, we process personal information based on consent, contractual necessity, legal obligations, legitimate interests, or another lawful basis. Where consent is required, we will obtain it before carrying out the relevant processing.'),
      ],
    },
    {
      heading: 'Disclosure of Information',
      blocks: [
        p('We may disclose information to:'),
        ul(
          "The employer responsible for a candidate's application and its authorized users.",
          'Hosting, storage, AI, authentication, email, security, and technical service providers.',
          'Professional advisers and auditors.',
          'Government authorities or other parties where legally required.',
          'Successors in connection with a merger, acquisition, or business transfer, subject to applicable law.',
        ),
        p('We do not sell personal information for monetary consideration. Any other disclosures will be handled in accordance with applicable law.'),
      ],
    },
    {
      heading: 'Data Retention',
      blocks: [
        p('We retain personal information for as long as necessary to provide our services, fulfill contractual obligations, comply with legal requirements, resolve disputes, and maintain security.'),
        p("Retention of recruitment records may also depend on the employer's instructions and applicable agreements."),
      ],
    },
    {
      heading: 'Data Security',
      blocks: [
        p('We implement appropriate technical and organizational measures designed to protect personal information against unauthorized access, loss, alteration, or disclosure.'),
        p('No method of electronic storage or transmission can be guaranteed to be completely secure.'),
      ],
    },
    {
      heading: 'International Transfers',
      blocks: [
        p('Information may be processed in countries where Novara or its service providers operate. Where required by applicable law, appropriate safeguards will be implemented for international transfers.'),
      ],
    },
    {
      heading: 'Your Rights',
      blocks: [
        p('Subject to applicable law, you may have the right to request access to, correction of, deletion of, or a copy of your personal information, restrict or object to certain processing, withdraw consent, or lodge a complaint with a relevant authority.'),
        p('Candidates whose information is processed on behalf of an employer may need to contact that employer to exercise their rights.'),
        p('Requests may be submitted to {email}.'),
      ],
    },
    {
      heading: 'Third-Party Services',
      blocks: [p('Our services may contain links to or integrations with third-party services. Their privacy practices are governed by their own policies.')],
    },
    {
      heading: 'Changes to This Policy',
      blocks: [p('We may update this Policy from time to time. The revised version will be published with an updated effective or revision date. Additional notice or consent will be provided where required by law.')],
    },
    {
      heading: 'Contact Us',
      blocks: [
        {
          kind: 'lines',
          items: [
            { label: 'Email', text: '{email}' },
            { label: 'Address', text: '{address}' },
            { label: 'Website', text: '{website}' },
          ],
        },
      ],
    },
  ],
};

const termsOfService: LegalDocument = {
  id: 'terms-of-service',
  title: 'Terms of Service',
  effective: '',
  updated: '',
  sections: [
    {
      heading: 'Acceptance of Terms',
      blocks: [
        p('These Terms of Service govern your access to and use of Novara, operated by {entity}.'),
        p('By registering for, accessing, or using Novara, you agree to these Terms. If you use Novara on behalf of an organization, you represent that you have authority to bind that organization to these Terms.'),
      ],
    },
    {
      heading: 'Description of Services',
      blocks: [
        p('Novara is an AI-powered recruitment and Applicant Tracking System that may provide:'),
        ul(
          'Job posting and applicant tracking.',
          'Candidate profile and resume management.',
          'AI-powered resume analysis and job-fit scoring.',
          'AI interview scheduling and evaluation.',
          'Interview reports and candidate insights.',
          'Recruitment workflow and user management.',
        ),
        p('Features may vary depending on the applicable plan and configuration.'),
      ],
    },
    {
      heading: 'Account Registration',
      blocks: [
        p('Users must provide accurate information and maintain the confidentiality of their login credentials.'),
        p('You are responsible for activity conducted through your account and must promptly report suspected unauthorized access.'),
        p('Novara may verify account information and restrict access where necessary for security or compliance.'),
      ],
    },
    {
      heading: 'Employer Obligations',
      blocks: [
        p('Employers and their authorized users must:'),
        ul(
          'Use Novara for lawful recruitment purposes.',
          'Ensure that job postings and hiring criteria are accurate and appropriate.',
          'Have a lawful basis for uploading and processing candidate information.',
          'Provide required privacy notices and obtain necessary consents.',
          'Protect confidential candidate information.',
          'Configure access permissions appropriately.',
          'Review AI-generated evaluations before making hiring decisions.',
          'Comply with applicable employment, privacy, and anti-discrimination laws.',
        ),
        p('Employers are responsible for their recruitment decisions and the use of candidate information.'),
      ],
    },
    {
      heading: 'Candidate Obligations',
      blocks: [
        p('Candidates must provide accurate information and submit documents they are authorized to share.'),
        p('Creating an account, applying for a job, or completing an AI interview does not guarantee shortlisting, an interview outcome, or employment.'),
        p('Documents submitted with a specific application may remain associated with that application even if the candidate subsequently updates their profile.'),
      ],
    },
    {
      heading: 'Acceptable Use',
      blocks: [
        p('You must not:'),
        ul(
          'Use Novara for unlawful or discriminatory purposes.',
          'Upload unauthorized, fraudulent, or malicious content.',
          'Access data belonging to another organization without authorization.',
          'Circumvent security controls or usage restrictions.',
          'Reverse engineer or exploit the platform except where legally permitted.',
          'Interfere with the operation, security, or availability of Novara.',
          'Misuse resumes, interview recordings, transcripts, or reports.',
        ),
        p('Novara may investigate violations and restrict access where reasonably necessary.'),
      ],
    },
    {
      heading: 'Customer Data',
      blocks: [
        p('Customers retain their rights in the data they submit, subject to third-party rights.'),
        p('You authorize Novara to host, process, transmit, and use submitted data as necessary to provide, secure, and maintain the services, in accordance with applicable agreements and privacy requirements.'),
        p('You are responsible for ensuring that submitted data may lawfully be processed.'),
      ],
    },
    {
      heading: 'Intellectual Property',
      blocks: [
        p('Novara and its licensors retain all rights in the platform, software, branding, designs, and documentation, except for rights expressly granted under these Terms.'),
        p("Users may not reproduce, distribute, resell, or exploit Novara's intellectual property without authorization."),
      ],
    },
    {
      heading: 'AI Features and Limitations',
      blocks: [
        p('AI-generated scores, explanations, summaries, and recommendations are intended to support recruitment workflows.'),
        p('Novara does not guarantee that AI outputs will be accurate, complete, unbiased, or suitable for every purpose. Outputs may require verification and human interpretation.'),
        p('Employers remain responsible for recruitment decisions and must comply with applicable requirements concerning automated decision-making.'),
      ],
    },
    {
      heading: 'Third-Party Services',
      blocks: [p('Novara may rely on third-party providers for hosting, AI processing, communications, and other functionality. The availability of certain features may depend on these providers.')],
    },
    {
      heading: 'Availability and Maintenance',
      blocks: [
        p('Novara aims to maintain reliable service availability but does not guarantee uninterrupted or error-free operation.'),
        p('Maintenance, technical failures, security incidents, or third-party disruptions may temporarily affect access.'),
      ],
    },
    {
      heading: 'Suspension and Termination',
      blocks: [
        p('Novara may suspend or terminate access where necessary to address material breaches, security risks, unlawful activity, or other grounds permitted by applicable law or contract.'),
        p('Customers may terminate their use of the services in accordance with their applicable subscription or service agreement.'),
        p('Data handling following termination is governed by the Privacy Policy and applicable agreements.'),
      ],
    },
    {
      heading: 'Disclaimer and Liability',
      blocks: [
        p('To the extent permitted by law, Novara does not warrant uninterrupted availability or particular recruitment outcomes.'),
        p('Any limitation of liability is subject to applicable law and any separate written agreement. Nothing in these Terms excludes liability that cannot lawfully be excluded.'),
      ],
    },
    {
      heading: 'Changes to Terms',
      blocks: [p('We may update these Terms from time to time. Material changes will be communicated where appropriate or required by law.')],
    },
    {
      heading: 'Governing Law',
      requires: 'jurisdiction',
      blocks: [p('These Terms are governed by the laws of {jurisdiction}, subject to mandatory legal protections applicable to users.')],
    },
    {
      heading: 'Contact',
      blocks: [
        {
          kind: 'lines',
          items: [
            { label: 'Email', text: '{email}' },
            { label: 'Address', text: '{address}' },
          ],
        },
      ],
    },
  ],
};

const termsAndConditions: LegalDocument = {
  id: 'terms-and-conditions',
  title: 'Terms and Conditions',
  effective: '',
  updated: '',
  sections: [
    {
      heading: 'General',
      blocks: [
        p("These Terms and Conditions govern the use of Novara's recruitment platform and related services provided by {entity}."),
        p('They should be read together with the Terms of Service, Privacy Policy, and any applicable subscription agreement or order form.'),
      ],
    },
    {
      heading: 'Subscription and Access',
      blocks: [
        p('Access to paid features is subject to the subscription plan or service agreement selected by the customer.'),
        p('The applicable agreement will specify the subscription period, permitted users, included features, usage limits, and other relevant conditions.'),
      ],
    },
    {
      heading: 'Fees and Payment',
      blocks: [
        p('Fees, billing frequency, payment methods, taxes, and renewal conditions will be specified in the applicable order form, invoice, or pricing terms.'),
        p('Customers are responsible for paying undisputed charges in accordance with the agreed payment schedule.'),
        p("Any automatic renewal, price change, or additional charge must be disclosed in accordance with applicable law and the customer's agreement."),
      ],
    },
    {
      heading: 'Usage Limits',
      blocks: [
        p('Novara may apply plan-specific limits to platform usage, including:'),
        ul(
          'Resume uploads and AI resume analysis.',
          'Job postings.',
          'AI interview usage.',
          'Concurrent interview sessions.',
          'Interview duration.',
          'Interview recording storage.',
          'Data storage and user access.',
        ),
        p("The applicable limits will be those communicated in the customer's plan or agreement."),
      ],
    },
    {
      heading: 'Subscription Renewal and Cancellation',
      blocks: [
        p('Subscription renewal, cancellation deadlines, changes to plans, and termination procedures are governed by the applicable agreement.'),
        p('Customers should submit cancellation requests through the designated process and within any applicable notice period.'),
      ],
    },
    {
      heading: 'Refunds and Service Credits',
      blocks: [
        p('Refund eligibility, service credits, and billing adjustments will be determined by the applicable agreement and mandatory consumer or commercial laws.'),
        p('No blanket exclusion of refunds or statutory rights is intended by these Terms.'),
      ],
    },
    {
      heading: 'Customer Responsibilities',
      blocks: [
        p('Customers are responsible for maintaining accurate account information, protecting account credentials, managing authorized users, and using the services lawfully.'),
        p('Customers must ensure that they have appropriate rights and permissions to submit candidate data, job descriptions, resumes, recordings, and other content.'),
      ],
    },
    {
      heading: 'Data and Confidentiality',
      blocks: [
        p('Customer data remains subject to the applicable customer agreement and Privacy Policy.'),
        p('Customers must protect confidential information and ensure that access is limited to authorized users. Data export, retention, and deletion following termination will be handled in accordance with the applicable agreement.'),
      ],
    },
    {
      heading: 'AI Services',
      blocks: [
        p('AI-generated evaluations and recommendations may contain inaccuracies and should be reviewed before use.'),
        p('Customers are responsible for ensuring that AI-assisted recruitment practices comply with applicable laws and that appropriate human oversight is applied.'),
      ],
    },
    {
      heading: 'Service Availability',
      blocks: [
        p('Novara may perform maintenance, deploy updates, or temporarily restrict services for security or operational reasons.'),
        p('Service-level commitments, uptime guarantees, and service credits apply only where expressly stated in an applicable agreement.'),
      ],
    },
    {
      heading: 'Suspension and Termination',
      blocks: [
        p('Novara may restrict or suspend services for material breaches, security risks, unlawful use, or overdue payments where permitted by the applicable agreement and law.'),
        p('Any post-termination access, export, deletion, or retention of customer data will follow the relevant contractual provisions.'),
      ],
    },
    {
      heading: 'Limitation of Liability',
      blocks: [p('Liability is subject to the applicable agreement and governing law. No provision excludes or limits liability where such exclusion or limitation is prohibited by law.')],
    },
    {
      heading: 'Amendments',
      blocks: [p('We may update these Terms and Conditions from time to time. Updates will be published with a revised date and communicated where required.')],
    },
    {
      heading: 'Governing Law and Contact',
      headingWithout: 'Contact',
      blocks: [
        p('These Terms and Conditions are governed by the laws of {jurisdiction}, subject to applicable mandatory legal requirements.', 'jurisdiction'),
        p('For questions, contact {email}.'),
        { kind: 'lines', items: [{ label: 'Address', text: '{address}' }] },
      ],
    },
  ],
};

const cookies: LegalDocument = {
  id: 'cookie-policy',
  title: 'Cookie Policy',
  effective: '29 October 2026',
  updated: '29 October 2026',
  sections: [
    {
      heading: 'Introduction',
      blocks: [p('This Cookie Policy explains how Novara uses cookies and similar technologies on its website and platform.')],
    },
    {
      heading: 'What Are Cookies?',
      blocks: [p('Cookies are small text files stored on your device when you visit a website. They may support website functionality, security, preferences, and analytics.')],
    },
    {
      heading: 'Types of Cookies',
      blocks: [
        {
          kind: 'terms',
          items: [
            { term: 'Strictly Necessary Cookies', text: 'Required for core functions such as authentication, session management, and security.' },
            { term: 'Functional Cookies', text: 'Used to remember preferences and improve the user experience.' },
            { term: 'Analytics Cookies', text: 'Used to understand website usage and identify performance issues.' },
            { term: 'Marketing Cookies', text: 'Used, where enabled, to measure marketing activities or support advertising.' },
          ],
        },
      ],
    },
    {
      heading: 'Third-Party Cookies',
      blocks: [p('Novara may use third-party services that place cookies or use similar technologies. Such providers may process information under their own privacy policies and applicable agreements.')],
    },
    {
      heading: 'Consent and Preferences',
      blocks: [
        p('Where required by law, Novara will obtain consent before using non-essential cookies. Where a cookie preference tool is provided, users may accept, reject, or customize non-essential cookies and change their preferences later.'),
        p('Strictly necessary cookies may remain active where permitted by law.'),
      ],
    },
    {
      heading: 'Managing Cookies',
      blocks: [
        p('Users may manage or delete cookies through their browser settings. Blocking cookies may affect login, security, and other platform functionality.'),
        p('Browser-level deletion may not automatically withdraw consent recorded through a separate preference tool.'),
      ],
    },
    {
      heading: 'Changes to This Policy',
      blocks: [p('We may update this Policy to reflect changes in technology, services, or legal requirements. The latest version will be published on our website.')],
    },
    {
      heading: 'Contact Us',
      blocks: [
        p('For questions about cookies and privacy, contact:'),
        { kind: 'lines', items: [{ label: 'Email', text: '{email}' }, { label: 'Website', text: '{website}' }] },
      ],
    },
  ],
};

/** Order matches the draft and the table of contents. */
export const legal = {
  seo: {
    title: 'Terms and policies | Novara',
    description: 'Novara Privacy Policy, Terms of Service, Terms and Conditions and Cookie Policy, on one page.',
  },
  eyebrow: 'Legal',
  title: 'Terms and policies',
  tocLabel: 'On this page',
  effectiveLabel: 'Effective date',
  updatedLabel: 'Last updated',
  documents: [privacy, termsOfService, termsAndConditions, cookies] as LegalDocument[],
};
