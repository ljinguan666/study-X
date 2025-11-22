/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string | undefined;
  readonly GEMINI_API_KEY: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

