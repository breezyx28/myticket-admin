import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { postAdminPasswordForgot } from '@/lib/adminPasswordReset';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/schemas/auth.schema';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: i18nZodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  return (
    <div className="min-h-dvh bg-surface-tint px-6 py-16">
      <div className="absolute end-4 top-4 sm:end-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
        <h1 className="text-2xl font-extrabold text-ink">{t('auth:forgot.title')}</h1>
        <p className="mt-2 text-[14px] text-ink-60">{t('auth:forgot.subtitle')}</p>
        {done ? (
          <p className="mt-6 rounded-xl bg-mint/25 px-4 py-3 text-[14px] font-medium text-ink">{t('auth:forgot.success')}</p>
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
                setSubmitError(e instanceof Error ? e.message : t('errors:somethingWrong'));
              } finally {
                setSubmitting(false);
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('common:email')}</span>
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
              {submitting ? t('auth:forgot.sending') : t('auth:forgot.sendLink')}
            </Button>
          </form>
        )}
        <div className="mt-6 text-[13px] font-semibold">
          <Link to="/login" className="text-coral hover:underline">
            {t('auth:forgot.backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
