import { Button } from '@/components/ui/Button';
import { postAdminPasswordForgot } from '@/lib/adminPasswordReset';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  return (
    <div className="min-h-dvh bg-surface-tint px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
        <h1 className="text-2xl font-extrabold text-ink">Reset access</h1>
        <p className="mt-2 text-[14px] text-ink-60">
          Enter your admin email. We will call the password reset request endpoint on your configured API base URL.
        </p>
        {done ? (
          <p className="mt-6 rounded-xl bg-mint/25 px-4 py-3 text-[14px] font-medium text-ink">
            If that email is registered for an admin account, you should receive reset instructions shortly.
          </p>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              setSubmitError(null);
              setSubmitting(true);
              try {
                await postAdminPasswordForgot(values.email);
                setDone(true);
              } catch (e) {
                setSubmitError(e instanceof Error ? e.message : 'Something went wrong');
              } finally {
                setSubmitting(false);
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Email</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('email')}
              />
            </label>
            {form.formState.errors.email ? (
              <p className="text-[12px] font-medium text-coral">{form.formState.errors.email.message}</p>
            ) : null}
            {submitError ? <p className="text-[12px] font-medium text-coral">{submitError}</p> : null}
            <Button type="submit" variant="dark" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}
        <div className="mt-6 text-[13px] font-semibold">
          <Link to="/login" className="text-coral hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
