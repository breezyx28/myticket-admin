import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().trim().email('validation.emailInvalid'),
  password: z.string().min(4, 'validation.passwordMin4'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('validation.emailInvalid'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, 'validation.passwordMin8'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'validation.passwordsMustMatch', path: ['confirm'] });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
