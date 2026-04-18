import { z } from 'zod';

export const roleApplicationTypeSchema = z.enum(['talent', 'vendor', 'organizer']);

export const reviewStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const platformUserRoleSchema = z.enum(['guest', 'talent', 'vendor', 'organizer']);

export const supportStatusSchema = z.enum(['open', 'in_progress', 'resolved']);
