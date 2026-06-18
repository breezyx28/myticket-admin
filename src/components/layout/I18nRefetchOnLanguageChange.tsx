import i18n from '@/i18n';
import { adminApi } from '@/services/adminApi';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/** Refetch cached API data when locale changes so server-localized labels refresh. */
export function I18nRefetchOnLanguageChange() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handler = () => {
      dispatch(adminApi.util.resetApiState());
    };
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, [dispatch]);

  return null;
}
