import { z } from 'zod';

export const adminKycDocStatusSchema = z.enum(['pending', 'approved', 'rejected', 'unknown']);

export type AdminKycDocStatus = z.infer<typeof adminKycDocStatusSchema>;

export const adminKycDocumentSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  docType: z.string().optional(),
  status: adminKycDocStatusSchema,
  uploadedAt: z.string().optional(),
  fileUrl: z.string().optional(),
});

export type AdminKycDocument = z.infer<typeof adminKycDocumentSchema>;

export const adminOrganizerKycDetailSchema = z.object({
  organizerId: z.string().min(1),
  organizerName: z.string().optional(),
  documents: z.array(adminKycDocumentSchema),
});

export type AdminOrganizerKycDetail = z.infer<typeof adminOrganizerKycDetailSchema>;

export const createFeeAdjustmentSchema = z.object({
  organizerId: z.string().min(1),
  amountSar: z.number().finite(),
  reason: z.string().min(1),
  reference: z.string().optional(),
});

export type CreateFeeAdjustmentInput = z.infer<typeof createFeeAdjustmentSchema>;

export const rejectOrganizerKycDocumentSchema = z.object({
  organizerId: z.string().min(1),
  docId: z.string().min(1),
  reason: z.string().optional(),
});

export type RejectOrganizerKycDocumentInput = z.infer<typeof rejectOrganizerKycDocumentSchema>;
