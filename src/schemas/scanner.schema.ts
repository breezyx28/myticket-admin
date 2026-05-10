import { z } from 'zod';

export const adminScannerStatusSchema = z.enum(['active', 'suspended', 'offline', 'unknown']);

export type AdminScannerStatus = z.infer<typeof adminScannerStatusSchema>;

export const adminScannerRowSchema = z.object({
  id: z.string().min(1),
  displayName: z.string(),
  status: adminScannerStatusSchema,
  organizerName: z.string().optional(),
  deviceLabel: z.string().optional(),
  lastSeenAt: z.string().optional(),
});

export type AdminScannerRow = z.infer<typeof adminScannerRowSchema>;

export const adminScannerListSchema = z.array(adminScannerRowSchema);

export const adminScanLogOutcomeSchema = z.enum(['valid', 'invalid', 'duplicate', 'error', 'unknown']);

export type AdminScanLogOutcome = z.infer<typeof adminScanLogOutcomeSchema>;

export const adminScanLogRowSchema = z.object({
  id: z.string().min(1),
  scannedAt: z.string(),
  outcome: adminScanLogOutcomeSchema,
  ticketRef: z.string().optional(),
  scannerLabel: z.string().optional(),
  eventTitle: z.string().optional(),
});

export type AdminScanLogRow = z.infer<typeof adminScanLogRowSchema>;

export const adminScanLogListSchema = z.array(adminScanLogRowSchema);
