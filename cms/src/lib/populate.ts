import type { Core } from '@strapi/strapi';

type Ctx = { query: Record<string, unknown> };

/** Route middleware factory: fill `populate` when the caller did not send one. */
export const withDefaultPopulate =
  (populate: Record<string, unknown>) =>
  (_config: unknown, _deps: { strapi: Core.Strapi }) =>
  async (ctx: Ctx, next: () => Promise<unknown>) => {
    if (ctx.query.populate === undefined) ctx.query = { ...ctx.query, populate };
    await next();
  };
