import { z } from 'zod';

export const listingModerationStatusSchema = z.enum([
  'queued',
  'claimed',
  'actioned',
  'rejected',
  'escalated',
]);

export const listingModerationRowSchema = z.object({
  id: z.string(),
  kind: z.enum(['talent', 'vendor']),
  title: z.string(),
  /** Owner contact email when present; otherwise a label such as "Owner #5". */
  ownerEmail: z.string().min(1),
  flagReason: z.string(),
  /** Report / queue body copy from the API when present. */
  description: z.string().optional(),
  status: listingModerationStatusSchema,
});

export type ListingModerationRow = z.infer<typeof listingModerationRowSchema>;

export const listingModerationListSchema = z.array(listingModerationRowSchema);

export const ratingModerationStateSchema = z.enum(['visible', 'hidden', 'deleted']);

export const ratingRowSchema = z.object({
  id: z.string(),
  targetLabel: z.string(),
  /** Reviewer email when present; otherwise a label such as "User #6". */
  authorEmail: z.string().min(1),
  stars: z.number().min(1).max(5),
  comment: z.string(),
  submittedAt: z.string(),
  moderationState: ratingModerationStateSchema.default('visible'),
});

export type RatingRow = z.infer<typeof ratingRowSchema>;

export const ratingListSchema = z.array(ratingRowSchema);
