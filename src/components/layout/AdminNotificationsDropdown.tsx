import { filterAdminOperationalNotifications } from '@/lib/adminNotificationKinds';
import { cn } from '@/lib/utils';
import type { AdminRecentNotificationRow } from '@/schemas/adminNotifications.schema';
import { useGetNotificationsRecentQuery } from '@/services/adminApi';
import { Bell } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { Link } from 'react-router-dom';

const DROPDOWN_LIMIT = 10;

function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function channelLabel(channel?: string): string {
  if (!channel) return '';
  return channel.replace(/_/g, ' ');
}

type PanelPos = { top: number; right: number };

type NotificationsPanelProps = {
  btnId: string;
  style: CSSProperties;
  panelRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  isError: boolean;
  items: AdminRecentNotificationRow[];
  onRetry: () => void;
  onClose: () => void;
};

function NotificationRow({ row, onNavigate }: { row: AdminRecentNotificationRow; onNavigate: () => void }) {
  const unread = row.read === false;
  const channel = channelLabel(row.channel);
  const className = cn(
    'block w-full px-4 py-3 text-left transition-colors hover:bg-surface-tint',
    unread && 'bg-coral/5',
  );
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-[13px] leading-snug text-ink', unread && 'font-bold')}>{row.title}</p>
        {unread ? (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral" aria-label="Unread" />
        ) : null}
      </div>
      {row.body ? <p className="mt-0.5 line-clamp-2 text-[12px] text-ink-60">{row.body}</p> : null}
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-ink-40">
        <span>{formatNotificationTime(row.createdAt)}</span>
        {channel ? (
          <>
            <span aria-hidden>·</span>
            <span className="capitalize">{channel}</span>
          </>
        ) : null}
      </div>
    </>
  );

  if (row.href) {
    return (
      <Link to={row.href} role="menuitem" className={className} onClick={onNavigate}>
        {inner}
      </Link>
    );
  }

  return (
    <div role="menuitem" className={className}>
      {inner}
    </div>
  );
}

function NotificationsPanel({
  btnId,
  style,
  panelRef,
  isLoading,
  isError,
  items,
  onRetry,
  onClose,
}: NotificationsPanelProps) {
  return (
    <div
      ref={panelRef}
      role="menu"
      aria-labelledby={btnId}
      className="fixed z-[10050] w-[min(100vw-1rem,22rem)] overflow-hidden rounded-2xl border border-ink-10 bg-white shadow-xl"
      style={style}
    >
      <div className="flex items-center justify-between border-b border-ink-10 px-4 py-3">
        <p className="text-[13px] font-bold text-ink">Notifications</p>
        <Link
          to="/settings/notifications"
          onClick={onClose}
          className="text-[12px] font-semibold text-coral hover:underline"
        >
          Settings
        </Link>
      </div>

      <div className="max-h-[min(24rem,60dvh)] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-5" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="px-4 py-6 text-center">
            <p className="text-[13px] text-ink-60">Could not load notifications.</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-[12px] font-semibold text-coral hover:underline"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-ink-60">No recent notifications.</p>
        ) : null}

        {!isLoading && !isError && items.length > 0 ? (
          <ul className="m-0 list-none divide-y divide-ink-10 p-0">
            {items.map((row) => (
              <li key={row.id} role="none">
                <NotificationRow row={row} onNavigate={onClose} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="border-t border-ink-10 bg-ink-5/40 px-4 py-2.5">
        <Link
          to="/settings/notifications"
          onClick={onClose}
          className="block text-center text-[12px] font-semibold text-ink-60 transition-colors hover:text-ink"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}

type AdminNotificationsDropdownProps = {
  className?: string;
};

export function AdminNotificationsDropdown({ className }: AdminNotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);
  const btnId = useId();

  const { data, isLoading, isError, refetch, isFetching } = useGetNotificationsRecentQuery();

  const adminRows = useMemo(() => filterAdminOperationalNotifications(data ?? []), [data]);
  const items = useMemo(() => adminRows.slice(0, DROPDOWN_LIMIT), [adminRows]);
  const unreadCount = useMemo(
    () => adminRows.filter((row) => row.read === false).length,
    [adminRows],
  );

  const updatePanelPosition = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    setPanelPos({ top: r.bottom + 8, right: Math.max(8, vw - r.right) });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener('resize', onScrollOrResize);
    document.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || portalRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const panel =
    open && panelPos ? (
      <NotificationsPanel
        btnId={btnId}
        panelRef={portalRef}
        style={{ top: panelPos.top, right: panelPos.right }}
        isLoading={isLoading || isFetching}
        isError={isError}
        items={items}
        onRetry={() => void refetch()}
        onClose={() => setOpen(false)}
      />
    ) : null;

  return (
    <div className={cn('inline-flex', className)} ref={wrapRef}>
      <button
        ref={btnRef}
        id={btnId}
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-10 bg-white text-ink-60 transition-colors',
          'hover:bg-ink-5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/35',
          open && 'border-coral/40 bg-surface-tint text-ink',
        )}
      >
        <Bell size={16} strokeWidth={2} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>
      {panel && typeof document !== 'undefined' ? createPortal(panel, document.body) : null}
    </div>
  );
}
