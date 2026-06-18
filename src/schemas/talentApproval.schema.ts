import { z } from 'zod';
import { reviewStatusSchema } from './shared';

export const governmentIdStatusSchema = z.enum(['pending', 'verified', 'rejected']);

export const governmentIdVerificationSchema = z.object({
  id: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  frontImageUrl: z.string().optional(),
  backImageUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
  status: governmentIdStatusSchema.optional(),
  rejectionReason: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  submittedAt: z.string().optional(),
});

export type GovernmentIdVerification = z.infer<typeof governmentIdVerificationSchema>;

export const talentGalleryItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string().min(1),
  caption: z.string().optional(),
  position: z.number().int().nonnegative(),
});

export type TalentGalleryItem = z.infer<typeof talentGalleryItemSchema>;

export const talentProfileSchema = z.object({
  id: z.string(),
  /** Public profile slug when API provides it (e.g. marketplace listing). */
  slug: z.string().optional(),
  userId: z.string().optional(),
  applicationId: z.string().optional(),
  stageName: z.string(),
  legalName: z.string(),
  /** Account email when present; otherwise a stable synthetic address from `user_id` for UI/search. */
  email: z.string().email(),
  phone: z.string(),
  /** Application contact fields when they differ from the linked user account. */
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  country: z.string(),
  city: z.string(),
  regionId: z.number().int().positive().optional(),
  cityId: z.number().int().positive().optional(),
  genres: z.array(z.string()),
  yearsExperience: z.number().int().nonnegative(),
  bio: z.string(),
  websiteUrl: z.string(),
  instagramHandle: z.string(),
  status: reviewStatusSchema,
  mediaQualityNote: z.string(),
  certificatesSummary: z.string(),
  submittedAt: z.string(),
  /** Empty when the talent has not uploaded intro media yet. */
  introVideoUrl: z.string(),
  headshotUrl: z.string(),
  portfolioPdfUrl: z.string(),
  governmentIdStatus: governmentIdStatusSchema,
  governmentIdVerification: governmentIdVerificationSchema.optional(),
  bankVerified: z.boolean(),
  completedBookings: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  ratingCount: z.number().int().nonnegative().optional(),
  travelReady: z.boolean().optional(),
  locationPublic: z.boolean().optional(),
  availabilityStatus: z.string().optional(),
  acceptedQualityDisclaimer: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  gallery: z.array(talentGalleryItemSchema).default([]),
  rejectReason: z.string().optional(),
});

export type TalentProfile = z.infer<typeof talentProfileSchema>;

export const talentProfilesListSchema = z.array(talentProfileSchema);

export const rejectTalentProfileSchema = z.object({
  reason: z.string().trim().min(3, 'validation.explainChanges'),
});

export type RejectTalentProfileInput = z.infer<typeof rejectTalentProfileSchema>;

export const rejectGovernmentIdSchema = z.object({
  reason: z.string().trim().min(3, 'validation.explainIdRejected'),
});

export type RejectGovernmentIdInput = z.infer<typeof rejectGovernmentIdSchema>;

/** Server-side filters for `GET /profiles/talents`. */
export type TalentProfilesListParams = {
  status?: 'pending' | 'approved' | 'rejected';
  governmentIdStatus?: 'pending' | 'verified' | 'rejected';
  isActive?: boolean;
};
