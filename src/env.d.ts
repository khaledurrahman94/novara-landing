interface ImportMetaEnv {
  /** `production` or `staging`. Both render index, follow; only preview and R&D pages are noindex (temporary for staging, a bad practice: see docs/deploy-site.md). Baked in at build. */
  readonly PUBLIC_SITE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
