/** Preset suspension reasons for admin user actions (select or customize). */
export const USER_SUSPENSION_PRESET_REASONS = [
  'Fraud investigation',
  'Terms of service violation',
  'Payment dispute or chargeback abuse',
  'Harassment or abusive behavior',
  'Spam or automated activity',
  'Identity verification failed',
] as const;

export type UserSuspensionPresetReason = (typeof USER_SUSPENSION_PRESET_REASONS)[number];

export const USER_SUSPENSION_CUSTOM_OPTION = '__custom__' as const;
