import { Button } from '@/components/ui/Button';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/config/demoAuth';
import { allowDemoAuth } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';
import { notifyError, notifySuccess } from '@/lib/notify';
import { loginFormSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation } from 'react-router-dom';

export function LoginPage() {
  const { user, signIn } = useAuth();
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
    // #region agent log
    if (!res.ok) {
      fetch('http://127.0.0.1:7432/ingest/9310ec5a-5875-4024-ad96-7ace7d477385', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'fb32e8' },
        body: JSON.stringify({
          sessionId: 'fb32e8',
          runId: 'pre-fix',
          hypothesisId: 'H-ui',
          location: 'LoginPage.tsx:onSubmit',
          message: 'signIn failed',
          data: { reason: res.reason },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion
    if (!res.ok) {
      if (res.reason === 'not_admin') {
        notifyError('Access denied — this dashboard is for administrator accounts only.');
        form.setError('root', {
          message: 'Access denied — this dashboard is for Administrator accounts only.',
        });
      } else if (res.reason === 'network') {
        notifyError('Could not reach the server. Check your connection and API base URL.');
        form.setError('root', { message: 'Network error — try again.' });
      } else if (res.reason === 'session') {
        notifyError('Login succeeded but the response did not include tokens. Check API contract.');
        form.setError('root', { message: 'Unexpected login response (missing tokens).' });
      } else if (res.reason === 'server') {
        notifyError('Server error during sign-in.');
        form.setError('root', { message: 'Server error — try again later.' });
      } else {
        notifyError('Invalid email or password.');
        form.setError('root', { message: 'Invalid credentials.' });
      }
    } else {
      notifySuccess('Signed in to the admin console.');
    }
  }

  return (
    <div className="min-h-dvh bg-surface-tint">
      <div className="mx-auto flex min-h-dvh max-w-[1280px] flex-col justify-center px-6 py-16 lg:px-8">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">Admin Area</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Sign in</h1>
          <p className="mt-2 text-[14px] text-ink-60">
            No self-registration — admin accounts are provisioned internally. No social login on this surface.
          </p>
          {allowDemoAuth() ? (
            <p className="mt-3 rounded-xl bg-ink-5 px-3 py-2 text-[12px] font-medium text-ink-60">
              Demo sign-in is enabled — press <span className="font-bold text-ink">Continue</span> with the pre-filled
              account, or use any email containing <span className="font-mono">+admin</span>.
            </p>
          ) : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Email</span>
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
                <span className="text-[12px] font-semibold text-ink-60">Password</span>
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
              Continue
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap justify-between gap-2 text-[13px] font-semibold">
            <Link to="/forgot-password" className="text-coral hover:underline">
              Forgot password
            </Link>
            {allowDemoAuth() ? (
              <span className="text-ink-40">
                Demo: {DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
