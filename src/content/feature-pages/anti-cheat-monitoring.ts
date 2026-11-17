import type { FeaturePageContent } from './types';
import { DEMO_HREF, demoAndExplore, featureShot } from './shared';

const img = (name: string, alt: string, width: number, height: number) => featureShot('anti-cheat-monitoring', name, alt, width, height);

export const antiCheatMonitoring: FeaturePageContent = {
  seo: {
    title: 'AI Interview Anti-Cheat Monitoring | Novara',
    description:
      'Track tab switching, full-screen exits, copy-and-paste, camera status, multiple faces and looking-away activity during every Novara AI interview.',
  },
  hero: {
    title: 'AI Interview Proctoring Software for Interview Integrity',
    text: "Monitor candidate activity during AI interviews with Novara's anti-cheat monitoring features. Track tab switching, full-screen exits, camera status, multiple faces, looking away, and other interview activity.",
    ctas: demoAndExplore('#tab-switching'),
    visual: img('interview-monitoring', 'An AI interview under review: the candidate video with a session timeline beside integrity events such as tab switches and full-screen exits', 1528, 864),
  },
  groups: [
    {
      id: 'tab-switching',
      rows: [
        {
          title: 'Detect Tab Switching During AI Interviews',
          text: 'Monitor when candidates switch browser tabs during an AI interview, giving recruiters additional visibility into interview activity.',
          side: 'left',
          visual: img('tab-switching', 'Remote proctoring session with the candidate on webcam, live monitoring status and an activity log', 1600, 1230),
        },
      ],
    },
    {
      id: 'full-screen-exits',
      rows: [
        {
          title: 'Monitor Full-Screen Exits During Online Interviews',
          text: 'Track when candidates leave full-screen interview mode to help recruiters understand interruptions or changes in the interview environment.',
          side: 'right',
          visual: img('fullscreen-exits', 'Full-screen mode timeline for an interview with one exit at 00:14:32, returned after 8 seconds', 1148, 482),
        },
      ],
    },
    {
      id: 'copy-paste',
      rows: [
        {
          title: 'Track Copy-and-Paste Activity During AI Interviews',
          text: 'Monitor copy-and-paste actions during candidate interviews to provide additional context about how candidates interact with the interview environment.',
          side: 'left',
          visual: img('copy-paste', 'Interview review with the candidate video, alert logs and snapshots taken during the session', 1600, 1212),
        },
      ],
    },
    {
      id: 'camera-status',
      rows: [
        {
          title: 'Monitor Candidate Camera Status Throughout Interviews',
          text: 'Keep track of candidate camera status during AI interviews to identify when video availability changes during the assessment.',
          side: 'right',
          visual: img('camera-status', 'Interview intelligence panel listing integrity signals such as tab changes, face out of view and multiple faces detected', 1600, 1183),
        },
      ],
    },
    {
      id: 'multiple-faces',
      rows: [
        {
          title: 'Detect Multiple Faces During Candidate Interviews',
          text: 'Monitor the presence of multiple faces in the camera view during an AI interview, helping recruiters identify situations that may require further review.',
          side: 'left',
          visual: img('multiple-faces', 'Interview video with candidate and device detection boxes, ID and photo verification, chat and alert logs', 1600, 1208),
        },
      ],
    },
    {
      id: 'focus-activity',
      rows: [
        {
          title: 'Monitor Candidate Focus and Looking-Away Activity',
          text: 'Track looking-away and focus-related activity during AI interviews to give recruiters additional context about candidate behavior throughout the assessment.',
          ctas: demoAndExplore('#how-it-works'),
          side: 'right',
          visual: img('focus-looking-away', 'Focus summary for an interview: 92% on screen, looking away 3 times, and focus in 5-minute blocks', 1148, 462),
        },
      ],
    },
  ],
  how: {
    title: 'How Novara Anti Cheat Monitoring Works?',
    intro: 'Monitoring runs in the background of every AI interview, from the moment the candidate joins to the moment you review.',
    steps: [
      { title: 'Start AI Interview', text: 'Candidate joins the AI interview session.' },
      { title: 'Monitor Activity', text: 'Novara monitors supported browser and camera activity.' },
      { title: 'Detect Events', text: 'Identify tab switches, camera changes, and other monitored events.' },
      { title: 'Review Activity', text: 'Recruiters use monitoring information as additional interview context.' },
    ],
  },
  why: {
    title: 'Why Use Novara for AI Interview Integrity Monitoring?',
    text: 'Give every AI interview the same watchful eye, and give your team clear, timestamped context when something needs a second look.',
    cta: { label: 'Book Now', href: DEMO_HREF },
    reasons: [
      { icon: 'scale', title: 'The same rules for every candidate', text: 'Every AI interview is monitored the same way, so no candidate is judged on a hunch.' },
      { icon: 'eye', title: 'Context, not accusations', text: 'Events are signals for review. Your team decides what they mean.' },
      { icon: 'clock', title: 'Timestamped events', text: 'Each event shows when it happened and how long it lasted.' },
      { icon: 'layers', title: 'One review screen', text: 'Interview video and integrity events sit together, so review takes minutes.' },
      { icon: 'shield', title: 'Built into the AI interview', text: 'Monitoring runs inside the interview session alongside the questions.' },
      { icon: 'users', title: 'Your team stays in control', text: 'Recruiters and hiring managers review the flags and make the call.' },
    ],
  },
  faq: {
    title: 'FAQs',
    items: [
      { q: 'What does anti-cheat monitoring track?', a: 'Tab switching, full-screen exits, copy-and-paste actions, camera status, multiple faces in view, and looking-away activity during the AI interview.' },
      { q: 'Does Novara reject candidates automatically?', a: 'No. Monitoring events are additional context for your review. Your team decides what they mean and what happens next.' },
      { q: 'Can I see exactly when an event happened?', a: 'Yes. Every event is timestamped in the session, so you can see when it happened and how long it lasted.' },
    ],
  },
  close: {
    title: 'Bring Greater Visibility to Every AI Interview',
    text: 'See tab switches, camera changes and focus shifts in one timestamped review, so integrity questions get clear answers.',
    cta: { label: 'Book Demo', href: DEMO_HREF },
  },
};
