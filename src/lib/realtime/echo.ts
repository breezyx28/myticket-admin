import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getBroadcastingAuthUrl, readReverbConfig } from './config';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo<'reverb'>;
  }
}

let echoInstance: Echo<'reverb'> | null = null;
let echoAuthToken: string | null = null;
let warnedMissing = false;

export function getEcho(): Echo<'reverb'> | null {
  return echoInstance;
}

/** @deprecated Use getEcho — kept for any legacy imports */
export const getAdminEcho = getEcho;

export function connectEcho(token: string): Echo<'reverb'> | null {
  const cfg = readReverbConfig();
  if (!cfg) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.info('[realtime] Reverb env not configured; admin realtime disabled.');
    }
    return null;
  }

  if (echoInstance && echoAuthToken !== token) {
    disconnectEcho();
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
    authEndpoint: getBroadcastingAuthUrl(),
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  window.Echo = echoInstance;
  return echoInstance;
}

export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
  echoAuthToken = null;
  window.Echo = undefined;
}

/** @deprecated Use disconnectEcho */
export const destroyAdminEcho = disconnectEcho;
