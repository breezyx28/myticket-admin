import { z } from 'zod';

export const feeTypeSchema = z.enum(['percent', 'flat', 'combined']);

export const feePayerSchema = z.enum(['buyer', 'organizer']);

export const feeConfigurationSchema = z.object({
  feeType: feeTypeSchema,
  percent: z.number().min(0).max(100),
  flatSar: z.number().min(0),
  payer: feePayerSchema,
  auctionCommissionPercent: z.number().min(0).max(100),
  thirdPartySharePercent: z.number().min(0).max(100),
});

export type FeeConfiguration = z.infer<typeof feeConfigurationSchema>;

export const feeConfigurationFormSchema = feeConfigurationSchema;

export const notificationSettingsSchema = z.object({
  channels: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    push: z.boolean(),
  }),
  reminderOffsetsHours: z.array(z.number().positive()),
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
