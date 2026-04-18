import { z } from 'zod';
import { roleApplicationTypeSchema, reviewStatusSchema } from './shared';

export const roleApplicationSchema = z.object({
  id: z.string(),
  applicantName: z.string(),
  email: z.string().email(),
  type: roleApplicationTypeSchema,
  status: reviewStatusSchema,
  submittedAt: z.string(),
  documentsSummary: z.string(),
  rejectReason: z.string().optional(),
});

export type RoleApplication = z.infer<typeof roleApplicationSchema>;

export const roleApplicationsListSchema = z.array(roleApplicationSchema);

export const rejectRoleApplicationSchema = z.object({
  reason: z.string().trim().min(3, 'Provide a short reason for the applicant'),
  internalNote: z.string().trim().optional(),
});

export type RejectRoleApplicationInput = z.infer<typeof rejectRoleApplicationSchema>;
