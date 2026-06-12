import { getAdminEcho } from '@/lib/realtime/echo';
import { adminApi } from '@/services/adminApi';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export function useTourismAdsRealtime() {
  const dispatch = useDispatch();

  useEffect(() => {
    const echo = getAdminEcho();
    if (!echo) return;

    const channel = echo.private('admin.tourism_ads');
    const handler = () => {
      dispatch(adminApi.util.invalidateTags(['TourismAds', 'Dashboard']));
    };

    channel.listen('.tourism_ad.status_changed', handler);

    return () => {
      channel.stopListening('.tourism_ad.status_changed');
      echo.leave('admin.tourism_ads');
    };
  }, [dispatch]);
}
