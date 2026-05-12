import { z } from 'zod';
import { supportStatusSchema } from './shared';

export const supportPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

export const supportThreadSchema = z.object({
  id: z.string(),
  /** Case reference from API (e.g. SC-DEMO-0001). */
  code: z.string().optional(),
  /** Requester display name from nested `user` when present (e.g. full_name / display_name). */
  requesterDisplayName: z.string().optional(),
  /** Requester email when present; otherwise a short label such as "User #6". */
  userEmail: z.string().min(1),
  subject: z.string(),
  status: supportStatusSchema,
  /** API `priority` when present. */
  priority: supportPrioritySchema.optional(),
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
  /** From API `resolution_note` on case detail. */
  resolutionNote: z.string().optional(),
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
