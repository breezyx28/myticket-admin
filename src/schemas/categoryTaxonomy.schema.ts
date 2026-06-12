import { z } from 'zod';
import { eventCategoryListSchema, eventCategoryUpsertFormSchema } from './event.schema';

export const categoryListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(500).optional(),
});

export type CategoryListParams = z.infer<typeof categoryListParamsSchema>;

export const eventCategoriesListResultSchema = z.object({
  items: eventCategoryListSchema,
  currentPage: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type EventCategoriesListResult = z.infer<typeof eventCategoriesListResultSchema>;

export const badgeCategorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nameEn: z.string(),
  nameAr: z.string(),
  active: z.boolean(),
  displayOrder: z.number().int().min(0).max(65535).optional(),
  isCustom: z.boolean().optional(),
  createdByUserId: z.string().nullable().optional(),
});

export type BadgeCategory = z.infer<typeof badgeCategorySchema>;

export const badgeCategoryListSchema = z.array(badgeCategorySchema);

export const badgeCategoriesListResultSchema = z.object({
  items: badgeCategoryListSchema,
  currentPage: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type BadgeCategoriesListResult = z.infer<typeof badgeCategoriesListResultSchema>;

export const badgeCategoryUpsertFormSchema = eventCategoryUpsertFormSchema.omit({
  iconKey: true,
  colorToken: true,
});

export type BadgeCategoryUpsertForm = z.infer<typeof badgeCategoryUpsertFormSchema>;

export type CategoryTaxonomyTab = 'events' | 'talent' | 'vendor';
