import { z } from 'zod';

export const localizedGeoNameSchema = z.object({
  id: z.number().int().positive().optional(),
  code: z.string().optional(),
  nameEn: z.string(),
  nameAr: z.string(),
});

export type LocalizedGeoName = z.infer<typeof localizedGeoNameSchema>;

export const saudiCitySchema = localizedGeoNameSchema;

export type SaudiCity = z.infer<typeof saudiCitySchema>;

export const saudiRegionSchema = localizedGeoNameSchema.extend({
  cities: z.array(saudiCitySchema).optional(),
});

export type SaudiRegion = z.infer<typeof saudiRegionSchema>;

export const saudiRegionsListSchema = z.array(saudiRegionSchema);

export const saudiCitiesListSchema = z.array(saudiCitySchema);
