import { Button } from '@/components/ui/Button';
import { resetPasswordSchema, type ResetPasswordValues } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? 'demo-token';
  const [done, setDone] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '', confirm: '' },
  });

  return (
    <div className="min-h-dvh bg-surface-tint px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
        <h1 className="text-2xl font-extrabold text-ink">Choose a new password</h1>
        {done ? (
          <p className="mt-6 rounded-xl bg-mint/25 px-4 py-3 text-[14px] font-medium text-ink">
            Password updated (demo). You can return to sign in.
          </p>
        ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={form.handleSubmit(() => {
                setDone(true);
              })}
            >
            <input type="hidden" {...form.register('token')} />
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">New password</span>
              <input
                type="password"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('password')}
              />
            </label>
            {form.formState.errors.password ? (
              <p className="text-[12px] font-medium text-coral">{form.formState.errors.password.message}</p>
            ) : null}
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Confirm</span>
              <input
                type="password"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('confirm')}
              />
            </label>
            {form.formState.errors.confirm ? (
              <p className="text-[12px] font-medium text-coral">{form.formState.errors.confirm.message}</p>
            ) : null}
            <Button type="submit" variant="dark" className="w-full" size="lg">
              Update password
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
