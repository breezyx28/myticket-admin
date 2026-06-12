import { getApiBaseUrl } from '@/config/env';
import { getAccessToken } from '@/lib/authSession';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echoInstance: Echo<'reverb'> | null = null;
let echoAuthToken: string | null = null;
let warnedMissing = false;

function reverbConfig() {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST;
  const portRaw = import.meta.env.VITE_REVERB_PORT;
  const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https';
  if (!key || !host) return null;
  const port = portRaw ? Number(portRaw) : scheme === 'https' ? 443 : 80;
  return { key, host, port, scheme };
}

export function getAdminEcho(): Echo<'reverb'> | null {
  const cfg = reverbConfig();
  if (!cfg) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.info('[realtime] Reverb env not configured; tourism ads realtime disabled.');
    }
    return null;
  }

  const token = getAccessToken() ?? '';
  if (echoInstance && echoAuthToken !== token) {
    destroyAdminEcho();
  }
  if (echoInstance) return echoInstance;

  window.Pusher = Pusher;
  echoAuthToken = token;
  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: cfg.key,
    wsHost: cfg.host,
    wsPort: cfg.port,
    wssPort: cfg.port,
    forceTLS: cfg.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${getApiBaseUrl()}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
}

export function destroyAdminEcho() {
  echoInstance?.disconnect();
  echoInstance = null;
  echoAuthToken = null;
}
