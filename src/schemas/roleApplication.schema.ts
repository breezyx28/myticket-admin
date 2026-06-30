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

export const roleApplicationOrganizerPayloadSchema = z.object({
  displayName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  bio: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  isCompany: z.boolean().optional(),
  companyName: z.string().optional(),
  companyInfo: z.string().optional(),
  ownerName: z.string().optional(),
  ownerInfo: z.string().optional(),
  documentUrl: z.string().optional(),
});

export type RoleApplicationOrganizerPayload = z.infer<typeof roleApplicationOrganizerPayloadSchema>;

export const roleApplicationDetailSchema = roleApplicationSchema.extend({
  userId: z.string().optional(),
  phone: z.string().optional(),
  applicantBio: z.string().optional(),
  profileImageUrl: z.string().optional(),
  reviewedAt: z.string().optional(),
  internalNote: z.string().optional(),
  organizer: roleApplicationOrganizerPayloadSchema.optional(),
});

export type RoleApplicationDetail = z.infer<typeof roleApplicationDetailSchema>;

export const rejectRoleApplicationSchema = z.object({
  reason: z.string().trim().min(3, 'validation.applicantReasonMin'),
  internalNote: z.string().trim().optional(),
});

export type RejectRoleApplicationInput = z.infer<typeof rejectRoleApplicationSchema>;
