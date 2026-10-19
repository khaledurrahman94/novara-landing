import type { Core } from '@strapi/strapi';

/**
 * The "Marketing" admin role (spec 05, lock-down rule 6). Rebuilt from code on every boot, so a new content type
 * is covered automatically and a hand-edit in the admin is undone.
 *
 * Gets: content-manager create, read, update, delete and publish on every `api::*` content type, and the media library.
 * Gets nothing else: no settings, plugins, roles, users, webhooks, API tokens or Content-Type Builder.
 */
const ROLE_CODE = 'marketing';

const CONTENT_ACTIONS = ['create', 'read', 'update', 'delete', 'publish'].map((a) => `plugin::content-manager.explorer.${a}`);

const MEDIA_ACTIONS = [
  'plugin::upload.read',
  'plugin::upload.assets.create',
  'plugin::upload.assets.update',
  'plugin::upload.assets.download',
  'plugin::upload.assets.copy-link',
];

type Action = { actionId: string; subjects?: string[] };

export const ensureMarketingRole = async (strapi: Core.Strapi): Promise<void> => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const roles = strapi.service('admin::role') as any;
  const permissions = strapi.service('admin::permission') as any;
  const contentTypes = strapi.service('admin::content-type') as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Strapi creates Super Admin, Editor and Author only when no role exists. Never get in its way.
  if (!(await roles.getSuperAdmin())) {
    strapi.log.warn('[marketing-role] No Super Admin role yet. The Marketing role will be created on the next boot.');
    return;
  }

  let role = await roles.findOne({ code: ROLE_CODE });
  if (!role) {
    role = await roles.create({
      name: 'Marketing',
      code: ROLE_CODE,
      description: 'Edits site copy, media and SEO, and publishes. No settings, users, tokens or schema access.',
    });
    strapi.log.info('[marketing-role] Created the Marketing role.');
  }

  const actions = (permissions.actionProvider.values() as Action[]).filter((a) => CONTENT_ACTIONS.includes(a.actionId));
  const restrictedSubjects = [...new Set(actions.flatMap((a) => a.subjects ?? []))].filter((uid) => !uid.startsWith('api::'));

  const contentPermissions = contentTypes.getPermissionsWithNestedFields(actions, { restrictedSubjects });
  const mediaPermissions = MEDIA_ACTIONS.map((action) => ({ action }));

  // Diff-based: adds what is missing, removes what is not listed, touches nothing when already right.
  await roles.assignPermissions(role.id, [...contentPermissions, ...mediaPermissions]);
};
