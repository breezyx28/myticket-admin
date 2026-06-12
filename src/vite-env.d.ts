/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ADMIN_READS_SOURCE?: string;
  readonly VITE_ALLOW_DEMO_AUTH?: string;
  readonly VITE_ADMIN_LOGIN_PHONE?: string;
  readonly VITE_ADMIN_LOGIN_OTP?: string;
  readonly VITE_REVERB_APP_KEY?: string;
  readonly VITE_REVERB_HOST?: string;
  readonly VITE_REVERB_PORT?: string;
  readonly VITE_REVERB_SCHEME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
