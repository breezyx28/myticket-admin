import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { postAdminPasswordReset } from '@/lib/adminPasswordReset';
import { resetPasswordSchema, type ResetPasswordValues } from '@/schemas/auth.schema';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

export function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const [params] = useSearchParams();
  const tokenFromUrl = params.get('token') ?? '';
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: i18nZodResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromUrl, password: '', confirm: '' },
  });

  const setToken = form.setValue;
  useEffect(() => {
    setToken('token', tokenFromUrl);
  }, [tokenFromUrl, setToken]);

  return (
    <div className="min-h-dvh bg-surface-tint px-6 py-16">
      <div className="absolute end-4 top-4 sm:end-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
        <h1 className="text-2xl font-extrabold text-ink">{t('auth:reset.title')}</h1>
        {!tokenFromUrl && !done ? (
          <p className="mt-4 rounded-xl border border-ink-10 bg-surface-tint px-4 py-3 text-[13px] text-ink-60">
            <Trans i18nKey="auth:reset.tokenHint" components={[<span key="1" className="font-mono text-ink" />]} />
          </p>
        ) : null}
        {done ? (
          <p className="mt-6 rounded-xl bg-mint/25 px-4 py-3 text-[14px] font-medium text-ink">{t('auth:reset.success')}</p>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              setSubmitError(null);
              setSubmitting(true);
              try {
                await postAdminPasswordReset(values.token, values.password);
                setDone(true);
              } catch (e) {
                setSubmitError(e instanceof Error ? e.message : t('errors:somethingWrong'));
              } finally {
                setSubmitting(false);
              }
            })}
          >
            <input type="hidden" {...form.register('token')} />
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('auth:reset.newPassword')}</span>
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
              <span className="text-[12px] font-semibold text-ink-60">{t('auth:reset.confirm')}</span>
              <input
                type="password"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('confirm')}
              />
            </label>
            {form.formState.errors.confirm ? (
              <p className="text-[12px] font-medium text-coral">{form.formState.errors.confirm.message}</p>
            ) : null}
            {form.formState.errors.token ? (
              <p className="text-[12px] font-medium text-coral">{form.formState.errors.token.message}</p>
            ) : null}
            {submitError ? <p className="text-[12px] font-medium text-coral">{submitError}</p> : null}
            <Button type="submit" variant="dark" className="w-full" size="lg" disabled={submitting || !tokenFromUrl}>
              {submitting ? t('auth:reset.updating') : t('auth:reset.updatePassword')}
            </Button>
          </form>
        )}
        <div className="mt-6 text-[13px] font-semibold">
          <Link to="/login" className="text-coral hover:underline">
            {t('auth:reset.backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
