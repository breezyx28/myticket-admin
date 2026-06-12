import {
  resetChannelBindings,
  subscribeAdminTourismAds,
  subscribeAdminVerifications,
  subscribeUserNotifications,
} from '@/lib/realtime/channels';
import { connectEcho, disconnectEcho } from '@/lib/realtime/echo';
import { getAccessToken } from '@/lib/authSession';
import { adminApi } from '@/services/adminApi';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

type Options = {
  userId?: string | null;
};

export function useAdminRealtime({ userId }: Options) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      disconnectEcho();
      resetChannelBindings();
      return;
    }

    const echo = connectEcho(token);
    if (!echo) return;

    if (userId) {
      subscribeUserNotifications(userId, () => {
        dispatch(adminApi.util.invalidateTags(['NotificationFeed', 'Dashboard']));
      });
    }

    subscribeAdminVerifications(() => {
      dispatch(adminApi.util.invalidateTags(['TalentProfiles', 'Dashboard']));
    });

    subscribeAdminTourismAds(() => {
      dispatch(adminApi.util.invalidateTags(['TourismAds', 'Dashboard']));
    });

    return () => {
      disconnectEcho();
      resetChannelBindings();
    };
  }, [dispatch, userId]);
}
