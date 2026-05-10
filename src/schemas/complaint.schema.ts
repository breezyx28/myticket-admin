import { z } from 'zod';

export const adminComplaintStatusSchema = z.enum(['open', 'triaged', 'resolved', 'escalated', 'unknown']);

export type AdminComplaintStatus = z.infer<typeof adminComplaintStatusSchema>;

export const adminComplaintRowSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  status: adminComplaintStatusSchema,
  category: z.string().optional(),
  reporterLabel: z.string().optional(),
  targetLabel: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type AdminComplaintRow = z.infer<typeof adminComplaintRowSchema>;

export const adminComplaintListSchema = z.array(adminComplaintRowSchema);
