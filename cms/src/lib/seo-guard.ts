import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

/**
 * Schema JSON cannot express "an object with @type", so enforce it for every `seo.meta` component
 * on write. The site build validates again.
 */
const MAX_JSON_CHARS = 20_000;

export const checkStructuredData = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object' || Array.isArray(value)) return 'structuredData must be a JSON object.';
  const type = (value as Record<string, unknown>)['@type'];
  if (typeof type !== 'string' || type.trim() === '') return 'structuredData must have a "@type" string.';
  if (JSON.stringify(value).length > MAX_JSON_CHARS) return `structuredData is over ${MAX_JSON_CHARS} characters.`;
  return null;
};

type Ctx = {
  uid: string;
  action: string;
  params?: { data?: Record<string, unknown> };
  contentType?: { attributes?: Record<string, { type?: string; component?: string }> };
};

export const registerSeoGuard = (strapi: Core.Strapi): void => {
  strapi.documents.use(async (ctx, next) => {
    const c = ctx as unknown as Ctx;
    if (c.uid.startsWith('api::') && ['create', 'update', 'clone'].includes(c.action) && c.params?.data) {
      for (const [name, attr] of Object.entries(c.contentType?.attributes ?? {})) {
        if (attr.type !== 'component' || attr.component !== 'seo.meta') continue;
        const seo = c.params.data[name] as { structuredData?: unknown } | null | undefined;
        const problem = checkStructuredData(seo?.structuredData);
        if (problem) throw new errors.ValidationError(`${name}: ${problem}`);
      }
    }
    return next();
  });
};
