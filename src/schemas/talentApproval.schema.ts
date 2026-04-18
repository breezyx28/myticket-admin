import { z } from 'zod';
import { reviewStatusSchema } from './shared';

export const governmentIdStatusSchema = z.enum(['pending', 'verified', 'rejected']);

export const talentProfileSchema = z.object({
  id: z.string(),
  stageName: z.string(),
  legalName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  country: z.string(),
  city: z.string(),
  genres: z.array(z.string()),
  yearsExperience: z.number().int().nonnegative(),
  bio: z.string(),
  websiteUrl: z.string(),
  instagramHandle: z.string(),
  status: reviewStatusSchema,
  mediaQualityNote: z.string(),
  certificatesSummary: z.string(),
  submittedAt: z.string(),
  introVideoUrl: z.string().url(),
  headshotUrl: z.string().url(),
  portfolioPdfUrl: z.string().url(),
  governmentIdStatus: governmentIdStatusSchema,
  bankVerified: z.boolean(),
  completedBookings: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  rejectReason: z.string().optional(),
});

export type TalentProfile = z.infer<typeof talentProfileSchema>;

export const talentProfilesListSchema = z.array(talentProfileSchema);

export const rejectTalentProfileSchema = z.object({
  reason: z.string().trim().min(3, 'Explain what needs to change'),
});

export type RejectTalentProfileInput = z.infer<typeof rejectTalentProfileSchema>;
