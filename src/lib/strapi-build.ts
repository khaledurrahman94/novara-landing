/**
 * Node-only half of the Strapi client: reads .env, picks live Strapi or fixtures, and loads fixtures
 * from disk. Used by the Content Layer loaders, the build integration and the fixtures scripts.
 * Never import this from a page or component (it can't run in workerd).
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NO_SOURCE_MESSAGE, StrapiError, liveSource, readStrapiConfig, type StrapiConfig, type StrapiResponse, type StrapiSource } from './strapi';

let envLoaded = false;

/** Load .env.local then .env into process.env. Real environment variables win, so CI settings override files. */
export function loadEnvFiles(root: string = process.cwd()): void {
  if (envLoaded) return;
  envLoaded = true;
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(path.join(root, file));
    } catch {
      // no such file: fine
    }
  }
}

export function buildConfig(root?: string): StrapiConfig {
  loadEnvFiles(root);
  return readStrapiConfig(process.env);
}

async function readJson(dir: string, file: string): Promise<unknown | undefined> {
  const full = path.resolve(dir, file);
  let text: string;
  try {
    text = await readFile(full, 'utf8');
  } catch {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (e) {
    throw new StrapiError(`Fixture file is not valid JSON: ${full} (${e instanceof Error ? e.message : String(e)}).`);
  }
}

export interface BuildSource extends StrapiSource {
  /** Fixtures only: read an extra JSON file that sits beside the Strapi responses, if present. */
  extra(file: string): Promise<unknown | undefined>;
}

export function fixtureSource(dir: string): BuildSource {
  const read = async (name: string): Promise<StrapiResponse> => {
    const body = await readJson(dir, `${name}.json`);
    if (body === undefined) {
      throw new StrapiError(`Fixture file not found: ${path.resolve(dir, `${name}.json`)}. A fixtures dir needs one JSON file per content type, shaped like the Strapi 5 REST response (see fixtures/strapi/good).`);
    }
    if (!body || typeof body !== 'object' || !('data' in body)) throw new StrapiError(`Fixture ${name}.json must be an object with a "data" key, like a Strapi 5 REST response.`);
    return body as StrapiResponse;
  };
  return {
    mode: 'fixtures',
    describe: () => `fixtures in ${dir}`,
    single: read,
    collection: async (plural) => {
      const res = await read(plural);
      if (!Array.isArray(res.data)) throw new StrapiError(`Fixture ${plural}.json must have "data" as an array.`);
      return res;
    },
    extra: (file) => readJson(dir, file),
  };
}

/** Pick the source for this build. Fails with a clear message when there is none. */
export function getSource(config: StrapiConfig = buildConfig()): BuildSource {
  if (config.fixturesDir) return fixtureSource(config.fixturesDir);
  if (config.url && !config.token) throw new StrapiError('STRAPI_URL is set but STRAPI_TOKEN is missing. Create a read-only API token in Strapi and set STRAPI_TOKEN.');
  if (config.url) return { ...liveSource(config), extra: async () => undefined };
  throw new StrapiError(NO_SOURCE_MESSAGE);
}
