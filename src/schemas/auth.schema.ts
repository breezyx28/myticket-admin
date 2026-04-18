import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
