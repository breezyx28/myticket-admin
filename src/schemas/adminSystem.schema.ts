import { z } from 'zod';

/** `GET /api/v1/admin/health` — core fields plus optional `extras` for unknown API keys. */
export const adminHealthViewSchema = z.object({
  status: z.string(),
  message: z.string().optional(),
  checkedAt: z.string().optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
});

export type AdminHealthView = z.infer<typeof adminHealthViewSchema>;

/** `GET /api/v1/admin/version` — deploy metadata; `extras` holds vendor-specific fields. */
export const adminVersionViewSchema = z.object({
  version: z.string(),
  commit: z.string().optional(),
  buildDate: z.string().optional(),
  environment: z.string().optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
});

export type AdminVersionView = z.infer<typeof adminVersionViewSchema>;
