export interface Cta {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface FeatureRowContent {
  eyebrow?: string;
  title: string;
  text: string;
  points?: string[];
  ctas?: Cta[];
  badge?: string;
  side?: 'left' | 'right';
  visual: Shot;
}

export interface FeatureGroupContent {
  id: string;
  title?: string;
  intro?: string;
  rows: FeatureRowContent[];
}

export interface StepContent {
  title: string;
  text: string;
}

export interface ReasonContent {
  icon: string;
  title: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FeaturePageContent {
  seo: { title: string; description: string };
  hero: { title: string; text: string; ctas: Cta[]; visual: Shot };
  groups: FeatureGroupContent[];
  how: { title: string; intro?: string; steps: StepContent[] };
  why: { title: string; text: string; cta: Cta; reasons: ReasonContent[] };
  faq: { title: string; intro?: string; items: FaqItem[] };
  close: { title: string; text: string; cta: Cta };
}
