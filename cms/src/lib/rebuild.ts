import type { Core } from '@strapi/strapi';

/**
 * Rebuild on publish. After a publish, unpublish or delete on any content type, or any media change,
 * wait for things to settle (debounce, default 60s), then POST once to DEPLOY_HOOK_URL.
 *
 * Env: DEPLOY_HOOK_URL (unset = no-op), DEPLOY_HOOK_BODY (raw string, usually JSON), DEPLOY_HOOK_HEADERS (JSON object),
 * DEPLOY_HOOK_DEBOUNCE_SECONDS (default 60).
 * Works with a Cloudflare deploy hook (POST, no body) and with GitHub repository_dispatch
 * (set the URL, a JSON body with event_type, and an Authorization header).
 */

const MAX_WAIT_MS = 10 * 60 * 1000; // a steady stream of edits cannot postpone a build forever
const RETRY_DELAYS_MS = [5_000, 20_000];

type Pending = { timer: NodeJS.Timeout; firstAt: number; reasons: Set<string> };
let pending: Pending | undefined;

const hookUrl = () => (process.env.DEPLOY_HOOK_URL ?? '').trim();
const debounceMs = () => {
  const s = Number(process.env.DEPLOY_HOOK_DEBOUNCE_SECONDS ?? 60);
  return (Number.isFinite(s) && s >= 0 ? s : 60) * 1000;
};

const parseHeaders = (strapi: Core.Strapi): Record<string, string> => {
  const raw = process.env.DEPLOY_HOOK_HEADERS;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, string>;
  } catch {
    // fall through
  }
  strapi.log.error('[rebuild] DEPLOY_HOOK_HEADERS is not a JSON object. Sending the hook without custom headers.');
  return {};
};

const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return 'invalid URL';
  }
};

const post = async (strapi: Core.Strapi, reasons: string[]): Promise<void> => {
  const url = hookUrl();
  if (!url) return;
  const body = process.env.DEPLOY_HOOK_BODY || undefined;
  const headers: Record<string, string> = { ...(body ? { 'content-type': 'application/json' } : {}), ...parseHeaders(strapi) };

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(15_000) });
      if (res.ok) {
        strapi.log.info(`[rebuild] hook sent to ${hostOf(url)} (${res.status}) after: ${reasons.join(', ')}`);
        return;
      }
      strapi.log.warn(`[rebuild] hook to ${hostOf(url)} answered ${res.status}`);
    } catch (error) {
      strapi.log.warn(`[rebuild] hook to ${hostOf(url)} failed: ${(error as Error).message}`);
    }
    const wait = RETRY_DELAYS_MS[attempt];
    if (wait === undefined) break;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  strapi.log.error('[rebuild] gave up. Trigger a deploy by hand.');
};

/** Queue a rebuild. Calls inside the debounce window collapse into one POST. */
export const scheduleRebuild = (strapi: Core.Strapi, reason: string): void => {
  if (!hookUrl()) return;
  const now = Date.now();
  const firstAt = pending?.firstAt ?? now;
  const reasons = pending?.reasons ?? new Set<string>();
  reasons.add(reason);
  if (pending) clearTimeout(pending.timer);

  const wait = Math.max(0, Math.min(debounceMs(), firstAt + MAX_WAIT_MS - now));
  const timer = setTimeout(() => {
    const fired = pending;
    pending = undefined;
    if (fired) void post(strapi, [...fired.reasons]);
  }, wait);
  pending = { timer, firstAt, reasons };
};

/** On shutdown, send a queued hook now instead of losing it. */
export const flushRebuild = async (strapi: Core.Strapi): Promise<void> => {
  if (!pending) return;
  clearTimeout(pending.timer);
  const reasons = [...pending.reasons];
  pending = undefined;
  await post(strapi, reasons);
};

type DocCtx = {
  uid: string;
  action: string;
  contentType?: { options?: { draftAndPublish?: boolean } };
  params?: { status?: string };
};

/** True when the action changes what the public site would build. */
const changesSite = (ctx: DocCtx): boolean => {
  if (['publish', 'unpublish', 'delete'].includes(ctx.action)) return true;
  if (!['create', 'update', 'clone'].includes(ctx.action)) return false;
  // Without draft and publish (redirects), a write is live. With it, only a write straight to the published version is.
  return !ctx.contentType?.options?.draftAndPublish || ctx.params?.status === 'published';
};

const isSiteContent = (uid: string) => uid.startsWith('api::');

export const registerRebuildTrigger = (strapi: Core.Strapi): void => {
  // Content types: publish, unpublish and delete (and live writes) through the Document Service.
  strapi.documents.use(async (ctx, next) => {
    const result = await next();
    const c = ctx as unknown as DocCtx;
    if (isSiteContent(c.uid) && changesSite(c)) scheduleRebuild(strapi, `${c.uid} ${c.action}`);
    return result;
  });

  // Media: the upload plugin writes through the database layer, so subscribe to its lifecycles.
  const media = (action: string) => () => scheduleRebuild(strapi, `media ${action}`);
  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
    afterCreate: media('create'),
    afterCreateMany: media('create'),
    afterUpdate: media('update'),
    afterUpdateMany: media('update'),
    afterDelete: media('delete'),
    afterDeleteMany: media('delete'),
  });
};
