/**
 * Small Strapi 5 REST client. Platform neutral (fetch only), so the build and the on-demand
 * preview route share it. Fixtures mode (reading JSON from disk) lives in strapi-build.ts because
 * it needs Node.
 *
 * Env vars: STRAPI_URL, STRAPI_TOKEN (read-only, build), STRAPI_PREVIEW_TOKEN (draft, preview only),
 * STRAPI_FIXTURES (dir of JSON shaped like Strapi responses, never in production), PUBLIC_SITE_ENV.
 */
import { parseSiteEnv, type SiteEnv } from './paths';

export type Env = Record<string, string | undefined>;

export interface StrapiConfig {
  siteEnv: SiteEnv;
  url?: string;
  token?: string;
  previewToken?: string;
  fixturesDir?: string;
}

/** Thrown for every Strapi problem. The message is written for a person reading a build log. */
export class StrapiError extends Error {
  override name = 'StrapiError';
}

export const NO_SOURCE_MESSAGE = [
  'No content source for the build.',
  'Set STRAPI_URL and STRAPI_TOKEN to build from Strapi (see .env.example),',
  'or set STRAPI_FIXTURES=fixtures/strapi/good to build from local fixtures (staging only).',
  'There is no silent fallback to local copy.',
].join('\n  ');

export function readStrapiConfig(env: Env): StrapiConfig {
  const get = (k: string) => env[k]?.trim() || undefined;
  const config: StrapiConfig = { siteEnv: parseSiteEnv(get('PUBLIC_SITE_ENV')) };
  const url = get('STRAPI_URL')?.replace(/\/+$/, '');
  const token = get('STRAPI_TOKEN');
  const previewToken = get('STRAPI_PREVIEW_TOKEN');
  const fixturesDir = get('STRAPI_FIXTURES');
  if (url) config.url = url;
  if (token) config.token = token;
  if (previewToken) config.previewToken = previewToken;
  if (fixturesDir) config.fixturesDir = fixturesDir;
  if (config.fixturesDir && config.siteEnv === 'production') {
    throw new StrapiError(
      `STRAPI_FIXTURES is set (${config.fixturesDir}) but PUBLIC_SITE_ENV=production. Production builds never use fixtures: unset STRAPI_FIXTURES.`,
    );
  }
  return config;
}

// ---- query building -------------------------------------------------------------------------

/** Nested field tree: `{ seo: { ogImage: true } }` populates seo and, inside it, ogImage. */
export interface PopulateTree {
  [field: string]: true | PopulateTree;
}

export type QueryValue = string | number | boolean | QueryValue[] | { [k: string]: QueryValue };

function toStrapiPopulate(tree: PopulateTree): Record<string, QueryValue> {
  const out: Record<string, QueryValue> = {};
  for (const [field, value] of Object.entries(tree)) {
    out[field] = value === true ? true : { populate: toStrapiPopulate(value) };
  }
  return out;
}

/** Builds the `populate` part of a Strapi query. `populate('*')` populates everything one level deep. */
export function populate(tree: PopulateTree | '*'): { populate: QueryValue } {
  return { populate: tree === '*' ? '*' : toStrapiPopulate(tree) };
}

/** Serialises nested params to Strapi's bracket syntax (`populate[seo][populate][ogImage]=true`). */
export function toQueryString(params: Record<string, QueryValue>): string {
  const parts: string[] = [];
  const walk = (key: string, value: QueryValue) => {
    if (Array.isArray(value)) value.forEach((v, i) => walk(`${key}[${i}]`, v));
    else if (typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(`${key}[${k}]`, v);
    else parts.push(`${encodeURIComponent(key).replace(/%5B/g, '[').replace(/%5D/g, ']')}=${encodeURIComponent(String(value))}`);
  };
  for (const [k, v] of Object.entries(params)) walk(k, v);
  return parts.join('&');
}

// ---- requests -------------------------------------------------------------------------------

export interface StrapiResponse {
  data: unknown;
  meta?: { pagination?: { page: number; pageCount: number; total: number } };
}

export interface RequestOptions {
  /** Fetch the draft version (Strapi `status=draft`). Needs a token that can read drafts. */
  draft?: boolean;
  /** Use this token instead of `config.token` (the preview route passes `previewToken`). */
  token?: string | undefined;
}

async function request(config: StrapiConfig, path: string, params: Record<string, QueryValue>, opts: RequestOptions): Promise<StrapiResponse> {
  if (!config.url) throw new StrapiError(NO_SOURCE_MESSAGE);
  const token = opts.token ?? config.token;
  const query = queryFor(params, opts);
  const endpoint = `${config.url}/api/${path}${query ? `?${query}` : ''}`;
  let res: Response;
  try {
    res = await fetch(endpoint, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (cause) {
    const reason = cause instanceof Error ? (cause.cause instanceof Error ? cause.cause.message : cause.message) : String(cause);
    throw new StrapiError(`Could not reach Strapi at ${config.url} (${reason}). Check STRAPI_URL and that the CMS is running.`);
  }
  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      detail = body.error?.message ? ` Strapi says: "${body.error.message}".` : '';
    } catch {
      // no JSON body
    }
    const hint =
      res.status === 401 ? ' The token is missing or wrong. Check STRAPI_TOKEN (STRAPI_PREVIEW_TOKEN for preview).'
      : res.status === 403 ? ' The token is valid but not allowed to read this. Give the read-only API token "find" on this content type.'
      : res.status === 404 ? ' The content type does not exist, has no published entry, or the token cannot see it.'
      : '';
    throw new StrapiError(`Strapi returned ${res.status} for GET /api/${path}.${hint}${detail}`);
  }
  try {
    return absolutizeMedia((await res.json()) as StrapiResponse, config.url) as StrapiResponse;
  } catch {
    throw new StrapiError(`Strapi returned a body that is not JSON for GET /api/${path}.`);
  }
}

function queryFor(params: Record<string, QueryValue>, opts: RequestOptions): string {
  return toQueryString({ ...params, ...(opts.draft ? { status: 'draft' } : {}) });
}

/** Single type: GET /api/<name>. Returns the raw Strapi response body. */
export function fetchSingle(config: StrapiConfig, name: string, params: Record<string, QueryValue> = {}, opts: RequestOptions = {}): Promise<StrapiResponse> {
  return request(config, name, params, opts);
}

/** Collection type: GET /api/<plural>, following pagination. Returns `data` as one array. */
export async function fetchCollection(config: StrapiConfig, plural: string, params: Record<string, QueryValue> = {}, opts: RequestOptions = {}): Promise<StrapiResponse> {
  const all: unknown[] = [];
  let page = 1;
  for (;;) {
    const res = await request(config, plural, { ...params, 'pagination[page]': page, 'pagination[pageSize]': 100 }, opts);
    if (!Array.isArray(res.data)) throw new StrapiError(`Expected a list from GET /api/${plural} but Strapi returned a single entry. Is "${plural}" the plural API id of a collection type?`);
    all.push(...res.data);
    const pg = res.meta?.pagination;
    if (!pg || page >= pg.pageCount) return { data: all, meta: { pagination: { page: 1, pageCount: 1, total: all.length } } };
    page += 1;
  }
}

/** Strapi serves local uploads as `/uploads/x.png`. Make every media url absolute so it works off the CMS origin. */
export function absolutizeMedia(value: unknown, base: string | undefined): unknown {
  if (!base) return value;
  if (Array.isArray(value)) return value.map((v) => absolutizeMedia(v, base));
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = absolutizeMedia(v, base);
    if (typeof out['url'] === 'string' && typeof out['mime'] === 'string' && out['url'].startsWith('/')) out['url'] = `${base}${out['url']}`;
    return out;
  }
  return value;
}

/** Where a collection's raw responses come from: live Strapi or fixtures. Same shape either way. */
export interface StrapiSource {
  mode: 'live' | 'fixtures';
  describe(): string;
  single(name: string, params?: Record<string, QueryValue>): Promise<StrapiResponse>;
  collection(plural: string, params?: Record<string, QueryValue>): Promise<StrapiResponse>;
}

export function liveSource(config: StrapiConfig): StrapiSource {
  return {
    mode: 'live',
    describe: () => `Strapi at ${config.url}`,
    single: (name, params) => fetchSingle(config, name, params),
    collection: (plural, params) => fetchCollection(config, plural, params),
  };
}
