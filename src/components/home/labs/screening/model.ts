/**
 * ScreeningLab scoring model. Pure and deterministic, shared by the build-time
 * markup and the browser script so both always agree.
 *
 * Job Fit Score = round(100 * sum(weight * strength) / sum(weight)) over the
 * requirements that are checked. Strength is 0 to 1 per resume and requirement.
 * A requirement counts as matched from 0.6, otherwise it is missing.
 * Illustrative demo data. Novara reports a Job Fit Score out of 100 with matching and
 * missing criteria and AI reasoning, but does not publish its weights, so the weights and
 * the strengths below are this demo's own stand-in for the AI.
 */
export type ReqId = 'node' | 'ts' | 'pg' | 'api' | 'k8s' | 'exp';

export interface Requirement {
  id: ReqId;
  label: string;
  weight: number;
  /** Checked when the demo loads. */
  on: boolean;
}

export const REQS: readonly Requirement[] = [
  { id: 'node', label: 'Node.js', weight: 3, on: true },
  { id: 'ts', label: 'TypeScript', weight: 2, on: true },
  { id: 'pg', label: 'PostgreSQL', weight: 2, on: true },
  { id: 'api', label: 'API design', weight: 2, on: true },
  { id: 'k8s', label: 'Kubernetes', weight: 1, on: false },
  { id: 'exp', label: 'Experience level: Senior', weight: 1, on: false },
];

export const MATCH_AT = 0.6;
/** The dashboard's top Job Fit band is "80-100 Strong Match". Nothing else about the bands is shown. */
export const STRONG_AT = 80;

type Six<T> = readonly [T, T, T, T, T, T];

export interface Applicant {
  id: string;
  name: string;
  initials: string;
  /** Strength per requirement, same order as REQS. */
  s: Six<number>;
  /** Short evidence per requirement, same order as REQS. */
  ev: Six<string>;
  /** New applications start in the tray, not the ranking. */
  fresh?: boolean;
  /** Two lines shown on the tray's resume card. */
  snippet?: readonly [string, string];
}

export const APPLICANTS: readonly Applicant[] = [
  {
    id: 'amara', name: 'Amara Okafor', initials: 'AO',
    s: [1, 0.9, 0.9, 0.85, 0.2, 0.9],
    ev: ['6 yrs, services in production', 'Typed APIs end to end', 'At scale, tuned slow queries', 'Led an API migration', 'No Kubernetes listed', '6 yrs, matches Senior'],
  },
  {
    id: 'ines', name: 'Ines Duarte', initials: 'ID',
    s: [0.85, 0.8, 1, 0.7, 0.6, 0.7],
    ev: ['4 yrs, event consumers', 'Daily use, strict mode', 'Schema design and replication', 'Designed internal APIs', 'Ran services on a cluster', '4 yrs, near the Senior bar'],
  },
  {
    id: 'leo', name: 'Leo Park', initials: 'LP',
    s: [0.9, 0.65, 0.7, 0.95, 0.2, 0.9],
    ev: ['5 yrs, payments APIs', 'In recent projects', 'Solid, some tuning', 'Built a public payments API', 'No Kubernetes listed', '5 yrs, matches Senior'],
  },
  {
    id: 'kenji', name: 'Kenji Sato', initials: 'KS',
    s: [0.7, 0.95, 0.6, 0.95, 0.8, 0.95],
    ev: ['Used in side services', '7 yrs, large codebases', 'Working knowledge', 'Led service design', 'Deployed on clusters', '9 yrs overall, matches Senior'],
  },
  {
    id: 'marcus', name: 'Marcus Webb', initials: 'MW',
    s: [1, 0.4, 0.7, 0.8, 0.1, 0.9],
    ev: ['6 yrs, REST and queues', 'Mostly plain JavaScript', 'Solid, light tuning', 'REST and queue APIs', 'No Kubernetes listed', '6 yrs, matches Senior'],
  },
  {
    id: 'nadia', name: 'Nadia Rahman', initials: 'NR',
    s: [0.5, 0.85, 0.5, 0.5, 0.2, 0.3],
    ev: ['Little Node.js on the resume', 'Strong, front and back end', 'Basic SQL only', 'No API design shown', 'No Kubernetes listed', '3 yrs, below Senior'],
  },
  {
    id: 'hana', name: 'Hana Fischer', initials: 'HF', fresh: true,
    s: [0.9, 0.85, 0.8, 0.9, 0.7, 0.6],
    ev: ['7 yrs, high-traffic services', 'Shared type libraries', 'Production, with migrations', 'Versioned public API', 'Some cluster work', '7 yrs, matches Senior'],
    snippet: ['Senior backend engineer, 7 yrs', 'Node.js, TypeScript, PostgreSQL'],
  },
  {
    id: 'tomas', name: 'Tomas Reyes', initials: 'TR', fresh: true,
    s: [0.3, 0.5, 0.9, 0.4, 0.9, 0.8],
    ev: ['Only in side projects', 'Little TypeScript', 'Database admin background', 'No API design shown', 'Runs clusters daily', '6 yrs, matches Senior'],
    snippet: ['Platform engineer, 6 yrs', 'PostgreSQL, Kubernetes, Go'],
  },
];

export const defaultActive = (): Set<ReqId> => new Set(REQS.filter((r) => r.on).map((r) => r.id));

export function score(a: Applicant, active: ReadonlySet<ReqId>): number {
  let num = 0;
  let den = 0;
  REQS.forEach((r, i) => {
    if (!active.has(r.id)) return;
    num += r.weight * (a.s[i] ?? 0);
    den += r.weight;
  });
  return den === 0 ? 0 : Math.round((100 * num) / den);
}

export interface Item { id: ReqId; label: string; note: string }
export interface Breakdown { matched: Item[]; missing: Item[]; reason: string }

export function breakdown(a: Applicant, active: ReadonlySet<ReqId>): Breakdown {
  const matched: Item[] = [];
  const missing: Item[] = [];
  let topLabel = '';
  let topValue = -1;
  REQS.forEach((r, i) => {
    if (!active.has(r.id)) return;
    const s = a.s[i] ?? 0;
    const item: Item = { id: r.id, label: r.label, note: a.ev[i] ?? '' };
    if (s >= MATCH_AT) {
      matched.push(item);
      if (s * r.weight > topValue) {
        topValue = s * r.weight;
        topLabel = r.label;
      }
    } else missing.push(item);
  });
  const n = matched.length + missing.length;
  const first = a.name.split(' ')[0] ?? a.name;
  const names = missing.map((x) => x.label);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : (names[0] ?? '');
  let reason = `${first} meets ${matched.length} of ${n} requirements`;
  if (topLabel) reason += `, strongest on ${topLabel}`;
  reason += missing.length ? `. Missing ${list}.` : '. Nothing is missing.';
  return { matched, missing, reason };
}

/** Highest score first. Ties keep the order of the list, so the sort is stable. */
export function rank(ids: readonly string[], active: ReadonlySet<ReqId>): string[] {
  const by = new Map(APPLICANTS.map((a, i) => [a.id, { a, i }]));
  return [...ids].sort((x, y) => {
    const ax = by.get(x);
    const ay = by.get(y);
    if (!ax || !ay) return 0;
    return score(ay.a, active) - score(ax.a, active) || ax.i - ay.i;
  });
}

/** Label key for a score band. Only the top band is named in the dashboard. */
export const band = (n: number): 'strong' | 'below' => (n >= STRONG_AT ? 'strong' : 'below');
