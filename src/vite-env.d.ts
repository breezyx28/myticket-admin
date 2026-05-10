/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ADMIN_READS_SOURCE?: string;
  readonly VITE_ALLOW_DEMO_AUTH?: string;
  readonly VITE_ADMIN_LOGIN_PHONE?: string;
  readonly VITE_ADMIN_LOGIN_OTP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
