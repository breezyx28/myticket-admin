import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, normalizeLocale } from '@/i18n/constants';
import { resources } from '@/i18n/resources';

function readStoredLocale(): string {
  try {
    return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

function applyDocumentLocale(lng: string) {
  const locale = normalizeLocale(lng);
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.title = i18n.t('pageTitle', { ns: 'common', defaultValue: 'MyTicket — Admin' });
}

export function persistLocale(lng: string) {
  const locale = normalizeLocale(lng);
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

void i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLocale(),
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: Object.keys(resources.en),
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

applyDocumentLocale(i18n.language);

i18n.on('languageChanged', (lng) => {
  applyDocumentLocale(lng);
  persistLocale(lng);
});

export default i18n;

export function getCurrentLocale() {
  return normalizeLocale(i18n.language);
}

export async function changeAppLanguage(lng: string) {
  const locale = normalizeLocale(lng);
  if (i18n.language === locale) return;
  await i18n.changeLanguage(locale);
}
