import { z } from 'zod';

export const adminScannerStatusSchema = z.enum(['active', 'suspended', 'offline', 'unknown']);

export type AdminScannerStatus = z.infer<typeof adminScannerStatusSchema>;

export const adminScannerRowSchema = z.object({
  id: z.string().min(1),
  code: z.string().optional(),
  displayName: z.string(),
  email: z.string().optional(),
  status: adminScannerStatusSchema,
  organizerProfileId: z.string().optional(),
  organizerName: z.string().optional(),
  organizerCompanyName: z.string().optional(),
  organizerCode: z.string().optional(),
  organizerSlug: z.string().optional(),
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
  result: z.string().optional(),
  ticketRef: z.string().optional(),
  scannerLabel: z.string().optional(),
  scannerId: z.string().optional(),
  scannerCode: z.string().optional(),
  scannerName: z.string().optional(),
  scannerEmail: z.string().optional(),
  organizerProfileId: z.string().optional(),
  organizerName: z.string().optional(),
  organizerCode: z.string().optional(),
  eventId: z.string().optional(),
  eventCode: z.string().optional(),
  eventTitle: z.string().optional(),
  eventStatus: z.string().optional(),
  eventDetailPath: z.string().optional(),
  ticketId: z.string().optional(),
  ticketCode: z.string().optional(),
  ticketStatus: z.string().optional(),
  ticketOrderId: z.string().optional(),
  ticketSeatLabel: z.string().optional(),
  ticketTypeName: z.string().optional(),
  ticketDetailPath: z.string().optional(),
});

export type AdminScanLogRow = z.infer<typeof adminScanLogRowSchema>;

export const adminScanLogListSchema = z.array(adminScanLogRowSchema);
