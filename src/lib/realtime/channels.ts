import type { NotificationPayload, RealtimeEnvelope } from './types';
import { getEcho } from './echo';

export type AdminRealtimeHandlers = {
  onNotification?: (payload: NotificationPayload) => void;
  onGovernmentId?: (payload: Record<string, unknown>) => void;
  onTourismAdStatus?: (payload: Record<string, unknown>) => void;
};

let userChannelBound = false;
let adminVerificationsBound = false;
let adminTourismBound = false;

export function subscribeUserNotifications(
  userId: string | number,
  onNotification: (payload: NotificationPayload) => void,
): void {
  const echo = getEcho();
  if (!echo || userChannelBound) return;

  const channel = echo.private(`user.${userId}`);
  channel.listen('.notification.created', (envelope: RealtimeEnvelope<NotificationPayload>) => {
    onNotification(envelope.payload);
  });
  userChannelBound = true;
}

export function subscribeAdminVerifications(
  onUpdate: (payload: Record<string, unknown>) => void,
): void {
  const echo = getEcho();
  if (!echo || adminVerificationsBound) return;

  echo.private('admin.verifications').listen(
    '.government_id.status_changed',
    (envelope: RealtimeEnvelope) => onUpdate(envelope.payload),
  );
  adminVerificationsBound = true;
}

export function subscribeAdminTourismAds(
  onUpdate: (payload: Record<string, unknown>) => void,
): void {
  const echo = getEcho();
  if (!echo || adminTourismBound) return;

  echo.private('admin.tourism_ads').listen(
    '.tourism_ad.status_changed',
    (envelope: RealtimeEnvelope) => onUpdate(envelope.payload),
  );
  adminTourismBound = true;
}

export function resetChannelBindings(): void {
  userChannelBound = false;
  adminVerificationsBound = false;
  adminTourismBound = false;
}
