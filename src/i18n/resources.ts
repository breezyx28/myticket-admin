import enApprovals from './locales/en/approvals.json';
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enErrors from './locales/en/errors.json';
import enInsights from './locales/en/insights.json';
import enNav from './locales/en/nav.json';
import enOperations from './locales/en/operations.json';
import enProfile from './locales/en/profile.json';
import enSettings from './locales/en/settings.json';
import enSupport from './locales/en/support.json';
import enTrust from './locales/en/trust.json';
import enValidation from './locales/en/validation.json';
import arApprovals from './locales/ar/approvals.json';
import arAuth from './locales/ar/auth.json';
import arCommon from './locales/ar/common.json';
import arDashboard from './locales/ar/dashboard.json';
import arErrors from './locales/ar/errors.json';
import arInsights from './locales/ar/insights.json';
import arNav from './locales/ar/nav.json';
import arOperations from './locales/ar/operations.json';
import arProfile from './locales/ar/profile.json';
import arSettings from './locales/ar/settings.json';
import arSupport from './locales/ar/support.json';
import arTrust from './locales/ar/trust.json';
import arValidation from './locales/ar/validation.json';

export const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    validation: enValidation,
    errors: enErrors,
    dashboard: enDashboard,
    approvals: enApprovals,
    operations: enOperations,
    settings: enSettings,
    insights: enInsights,
    trust: enTrust,
    support: enSupport,
    profile: enProfile,
  },
  ar: {
    common: arCommon,
    nav: arNav,
    auth: arAuth,
    validation: arValidation,
    errors: arErrors,
    dashboard: arDashboard,
    approvals: arApprovals,
    operations: arOperations,
    settings: arSettings,
    insights: arInsights,
    trust: arTrust,
    support: arSupport,
    profile: arProfile,
  },
} as const;

export type AppNamespace = keyof (typeof resources)['en'];
