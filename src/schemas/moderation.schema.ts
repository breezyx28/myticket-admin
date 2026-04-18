import { z } from 'zod';

export const listingModerationRowSchema = z.object({
  id: z.string(),
  kind: z.enum(['talent', 'vendor']),
  title: z.string(),
  ownerEmail: z.string().email(),
  flagReason: z.string(),
  status: z.enum(['queued', 'actioned']),
});

export type ListingModerationRow = z.infer<typeof listingModerationRowSchema>;

export const listingModerationListSchema = z.array(listingModerationRowSchema);

export const ratingRowSchema = z.object({
  id: z.string(),
  targetLabel: z.string(),
  authorEmail: z.string().email(),
  stars: z.number().min(1).max(5),
  comment: z.string(),
  submittedAt: z.string(),
});

export type RatingRow = z.infer<typeof ratingRowSchema>;

export const ratingListSchema = z.array(ratingRowSchema);
