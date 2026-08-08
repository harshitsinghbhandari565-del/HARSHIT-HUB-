/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Canonical site URL, provided by the hosting platform at deploy time
   * (TAD §18.5). Never a secret — invariant I3 keeps this surface empty.
   */
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/* CSS Modules (Preact islands — ADR-0002 consequence). */
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
