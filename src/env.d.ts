interface ImportMetaEnv {
  /** `production` or `staging`. Anything but `production` renders noindex everywhere. Baked in at build. */
  readonly PUBLIC_SITE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
