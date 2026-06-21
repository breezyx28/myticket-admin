import { AdminNotificationsDropdown } from '@/components/layout/AdminNotificationsDropdown';
import { I18nRefetchOnLanguageChange } from '@/components/layout/I18nRefetchOnLanguageChange';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';
import { useAuth } from '@/hooks/useAuth';
import { useNavGroups } from '@/hooks/useNavItems';
import { getAccessToken } from '@/lib/authSession';
import { shouldUseMockReads } from '@/services/adminReadMode';
import { cn } from '@/lib/utils';
import { LayoutDashboard, LogOut, Menu, Ticket, UserCircle, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';

export function AdminShell({ children }: { children?: ReactNode }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navGroups = useNavGroups();
  const { t } = useTranslation('common');
  useAdminRealtime({ userId: user?.id ?? null });

  function dataSourceBadge(): string {
    const token = getAccessToken();
    if (!token) return t('demoSession');
    if (shouldUseMockReads()) return t('mockReads');
    return t('apiReads');
  }

  return (
    <div className="min-h-dvh bg-surface-page text-ink">
      <I18nRefetchOnLanguageChange />
      <header className="sticky top-0 z-50 h-[72px] border-b border-ink-10 bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-full items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-full border border-ink-10 p-2 md:hidden"
              aria-label={t('openMenu')}
              onClick={() => setOpen(!open)}
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            <NavLink to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-ink">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lemon shadow-card-sm ring-1 ring-ink/5">
                <Ticket size={18} strokeWidth={2} className="text-ink" />
              </span>
              <span className="leading-tight">
                {t('appName')} <span className="text-coral">{t('appNameAdmin')}</span>
              </span>
            </NavLink>
            <span className="hidden rounded-full border border-ink-10 bg-ink-5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-60 lg:inline-flex">
              {t('controlCenter')}
            </span>
            <span className="hidden rounded-full bg-mint/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink md:inline-flex">
              {dataSourceBadge()}
            </span>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher compact />
            <AdminNotificationsDropdown />
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <NavLink
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-10 bg-white px-4 text-[13px] font-semibold text-ink-60 transition-colors hover:bg-ink-5 hover:text-ink"
            >
              <LayoutDashboard size={16} strokeWidth={2} />
              {t('overview')}
            </NavLink>
            <NavLink
              to="/profile"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-10 bg-white px-4 text-[13px] font-semibold text-ink-60 transition-colors hover:bg-ink-5 hover:text-ink"
            >
              <UserCircle size={16} strokeWidth={2} />
              {t('profile')}
            </NavLink>
            <AdminNotificationsDropdown />
            <div className="ms-1 flex items-center gap-2.5 rounded-2xl border border-ink-10 bg-white px-3 py-1.5">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-xl border border-ink-10 object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink-10 bg-surface-tint text-[11px] font-extrabold text-ink-40">
                  {(user?.name ?? user?.email ?? 'A').slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="max-w-[220px] truncate text-[12px] font-semibold text-ink">{user?.email}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-40">{t('administrator')}</p>
              </div>
            </div>
            <Button data-testid="sign-out" type="button" variant="outline" size="sm" onClick={() => signOut()}>
              <span className="inline-flex items-center gap-2">
                <LogOut size={16} strokeWidth={2} />
                {t('signOut')}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <div className="md:grid md:grid-cols-[18rem_minmax(0,1fr)]">
        <aside
          data-testid="admin-sidebar"
          className={cn(
            // Mobile drawer: anchor to inline-start (left in LTR, right in RTL) per CSS logical properties.
            'fixed inset-y-0 start-0 z-40 w-[86%] max-w-[320px] bg-white/95 p-6 transition-transform duration-200 ease-out',
            open ? 'translate-x-0' : '-translate-x-full rtl:-translate-x-auto',
            // Desktop: first grid column; dir=rtl on <html> places this column on the right automatically.
            'md:static md:z-30 md:w-auto md:max-w-none md:translate-x-0',
            'md:sticky md:top-[72px] md:h-[calc(100dvh-72px)] md:overflow-y-auto md:border-e md:border-ink-10 md:bg-white md:p-5 md:pt-6',
          )}
        >
          <div className="mb-6 flex items-center justify-between md:hidden">
            <p className="text-sm font-bold">{t('menu')}</p>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-ink-5"
              aria-label={t('closeMenu')}
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-8">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-40">
                  {group.title}
                </p>
                <nav className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      data-testid={`nav-${item.to.replace(/^\//, '').replace(/\//g, '-') || 'home'}`}
                      end={item.to === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition-colors',
                          isActive ? 'bg-ink text-white shadow-card-md' : 'text-ink-60 hover:bg-ink-5 hover:text-ink',
                        )
                      }
                    >
                      <item.icon size={18} strokeWidth={2} />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-ink-10 bg-ink-5/60 p-4 md:hidden">
            <button
              type="button"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white"
            >
              {t('signOut')}
            </button>
          </div>
        </aside>

        <main className="min-h-[calc(100dvh-72px)] flex-1 px-4 py-10 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1280px]">{children ?? <Outlet />}</div>
        </main>
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          aria-label={t('closeOverlay')}
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
