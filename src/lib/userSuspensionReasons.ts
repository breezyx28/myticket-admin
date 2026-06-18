/** Preset suspension reason translation keys (operations namespace). */
export const USER_SUSPENSION_PRESET_REASON_KEYS = [
  'suspensionReason.fraudInvestigation',
  'suspensionReason.termsViolation',
  'suspensionReason.paymentDispute',
  'suspensionReason.harassment',
  'suspensionReason.spam',
  'suspensionReason.identityVerificationFailed',
] as const;

export type UserSuspensionPresetReasonKey = (typeof USER_SUSPENSION_PRESET_REASON_KEYS)[number];

export const USER_SUSPENSION_CUSTOM_OPTION = '__custom__' as const;
