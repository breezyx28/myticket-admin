import { z } from 'zod';
import { supportStatusSchema } from './shared';

export const supportThreadSchema = z.object({
  id: z.string(),
  userEmail: z.string().email(),
  subject: z.string(),
  status: supportStatusSchema,
  updatedAt: z.string(),
  preview: z.string(),
});

export type SupportThread = z.infer<typeof supportThreadSchema>;

export const supportThreadListSchema = z.array(supportThreadSchema);

export const supportMessageSchema = z.object({
  id: z.string(),
  author: z.enum(['user', 'admin']),
  body: z.string(),
  sentAt: z.string(),
});

export const supportThreadDetailSchema = supportThreadSchema.extend({
  messages: z.array(supportMessageSchema),
});

export type SupportThreadDetail = z.infer<typeof supportThreadDetailSchema>;

export const updateSupportStatusSchema = z.object({
  status: supportStatusSchema,
  resolutionNote: z.string().trim().optional(),
});

export type UpdateSupportStatusInput = z.infer<typeof updateSupportStatusSchema>;

export const supportReplySchema = z.object({
  body: z.string().trim().min(1, 'Enter a reply'),
});

export type SupportReplyInput = z.infer<typeof supportReplySchema>;
