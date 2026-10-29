/** Content Layer loader factory: one loader per Strapi content type in collections.ts. Node only. */
import type { Loader } from 'astro/loaders';
import type { StrapiCollection } from './collections';
import { getSource } from './strapi-build';
import { StrapiError } from './strapi';

export function strapiLoader(def: StrapiCollection): Loader {
  return {
    name: `strapi:${def.name}`,
    async load({ store, parseData, generateDigest, logger }) {
      const source = getSource();
      const res = def.kind === 'single' ? await source.single(def.endpoint, def.params) : await source.collection(def.endpoint, def.params);
      const raw = def.kind === 'single' ? [res.data] : res.data;
      if (!Array.isArray(raw)) throw new StrapiError(`${def.name}: expected a list from ${source.describe()}.`);
      if (raw.length === 1 && raw[0] == null) throw new StrapiError(`${def.name}: ${source.describe()} returned no entry. Publish it in Strapi first.`);
      store.clear();
      for (const item of raw) {
        const id = def.entryId(item);
        const data = await parseData({ id, data: item as Record<string, unknown> });
        store.set({ id, data, digest: generateDigest(item as Record<string, unknown>) });
      }
      logger.info(`${def.name}: ${raw.length} entr${raw.length === 1 ? 'y' : 'ies'} from ${source.describe()}`);
    },
  };
}
