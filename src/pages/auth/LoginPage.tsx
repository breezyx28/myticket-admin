import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/config/demoAuth';
import { allowDemoAuth } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';
import { notifyError, notifySuccess } from '@/lib/notify';
import { loginFormSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation } from 'react-router-dom';

export function LoginPage() {
  const { user, signIn } = useAuth();
  const { t } = useTranslation(['auth', 'common']);
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? '/';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: allowDemoAuth()
      ? { email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD }
      : { email: '', password: '' },
  });

  if (user?.role === 'admin') {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    const res = await signIn({ email: values.email, password: values.password });
    if (!res.ok) {
      if (res.reason === 'not_admin') {
        notifyError(t('auth:login.accessDenied'));
        form.setError('root', { message: t('auth:login.accessDenied') });
      } else if (res.reason === 'network') {
        notifyError(t('auth:login.networkError'));
        form.setError('root', { message: t('auth:login.networkErrorShort') });
      } else if (res.reason === 'session') {
        notifyError(t('auth:login.sessionError'));
        form.setError('root', { message: t('auth:login.sessionErrorShort') });
      } else if (res.reason === 'server') {
        notifyError(t('auth:login.serverError'));
        form.setError('root', { message: t('auth:login.serverErrorShort') });
      } else {
        notifyError(t('auth:login.invalidCredentials'));
        form.setError('root', { message: t('auth:login.invalidCredentialsShort') });
      }
    } else {
      notifySuccess(t('auth:login.signedIn'));
    }
  }

  return (
    <div className="min-h-dvh bg-surface-tint">
      <div className="absolute end-4 top-4 sm:end-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex min-h-dvh max-w-[1280px] flex-col justify-center px-6 py-16 lg:px-8">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">{t('auth:login.areaLabel')}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{t('auth:login.title')}</h1>
          <p className="mt-2 text-[14px] text-ink-60">{t('auth:login.subtitle')}</p>
          {allowDemoAuth() ? (
            <p className="mt-3 rounded-xl bg-ink-5 px-3 py-2 text-[12px] font-medium text-ink-60">
              <Trans
                i18nKey="auth:login.demoHint"
                components={[
                  <span key="1" className="font-bold text-ink" />,
                  <span key="2" className="font-mono" />,
                ]}
              />
            </p>
          ) : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">{t('common:email')}</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  autoComplete="email"
                  placeholder={DEMO_ADMIN_EMAIL}
                  {...form.register('email')}
                />
              </label>
              {form.formState.errors.email ? (
                <p className="mt-1 text-[12px] font-medium text-coral">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">{t('common:password')}</span>
                <input
                  type="password"
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  autoComplete="current-password"
                  placeholder={DEMO_ADMIN_PASSWORD}
                  {...form.register('password')}
                />
              </label>
              {form.formState.errors.password ? (
                <p className="mt-1 text-[12px] font-medium text-coral">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            {form.formState.errors.root ? (
              <p className="rounded-xl bg-coral/15 px-4 py-3 text-[13px] font-medium text-ink">
                {form.formState.errors.root.message}
              </p>
            ) : null}
            <Button type="submit" variant="dark" className="w-full" size="lg">
              {t('auth:login.continue')}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap justify-between gap-2 text-[13px] font-semibold">
            <Link to="/forgot-password" className="text-coral hover:underline">
              {t('auth:login.forgotPassword')}
            </Link>
            {allowDemoAuth() ? (
              <span className="text-ink-40">
                {t('auth:login.demoCredentials', { email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
