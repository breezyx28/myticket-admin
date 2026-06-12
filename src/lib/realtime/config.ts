import { getApiBaseUrl } from '@/config/env';

export function getBroadcastingAuthUrl(): string {
  return `${getApiBaseUrl()}/broadcasting/auth`;
}

export type ReverbConfig = {
  key: string;
  host: string;
  port: number;
  scheme: 'http' | 'https';
};

export function readReverbConfig(): ReverbConfig | null {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST;
  const portRaw = import.meta.env.VITE_REVERB_PORT;
  const schemeRaw = import.meta.env.VITE_REVERB_SCHEME ?? 'https';
  if (!key || !host) return null;
  const scheme = schemeRaw === 'http' ? 'http' : 'https';
  const port = portRaw ? Number(portRaw) : scheme === 'https' ? 443 : 80;
  return { key, host, port, scheme };
}
