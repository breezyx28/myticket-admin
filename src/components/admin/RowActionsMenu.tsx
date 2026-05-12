import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

export type RowMenuAction = {
  key: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  loading?: boolean;
  onSelect: () => void | Promise<void>;
};

type RowActionsMenuProps = {
  ariaLabel?: string;
  actions: RowMenuAction[];
  align?: 'left' | 'right';
};

type PanelPos = { top: number; right?: number; left?: number };

export function RowActionsMenu({ actions, align = 'right', ariaLabel = 'Row actions' }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);
  const btnId = useId();

  const updatePanelPosition = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    if (align === 'right') {
      setPanelPos({ top: r.bottom + 6, right: vw - r.right });
    } else {
      setPanelPos({ top: r.bottom + 6, left: r.left });
    }
  };

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    updatePanelPosition();

    const onScrollOrResize = () => {
      updatePanelPosition();
    };
    window.addEventListener('resize', onScrollOrResize);
    document.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open, align]);

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

  const menuPanel =
    open && panelPos ? (
      <div
        ref={portalRef}
        className={cn(
          'fixed z-[10050] min-w-[10.5rem] rounded-xl border border-ink-10 bg-white py-1 shadow-xl',
          'pointer-events-auto',
        )}
        style={
          panelPos.right !== undefined
            ? { top: panelPos.top, right: panelPos.right }
            : { top: panelPos.top, left: panelPos.left }
        }
      >
        <ul role="menu" aria-labelledby={btnId} className="m-0 list-none p-0">
          {actions.map((a) => (
            <li key={a.key} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={a.disabled || a.loading}
                onClick={async () => {
                  try {
                    await a.onSelect();
                  } finally {
                    setOpen(false);
                  }
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-45',
                  a.danger
                    ? 'text-coral hover:bg-coral/10'
                    : 'text-ink hover:bg-ink-5/80',
                )}
              >
                {a.loading ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-10 border-t-ink-60" />
                ) : null}
                <span>{a.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div className="inline-flex" ref={wrapRef}>
      <button
        ref={btnRef}
        id={btnId}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink-10 bg-white text-ink transition-colors',
          'hover:border-coral/40 hover:bg-surface-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/35',
          open && 'border-coral/50 bg-surface-tint',
        )}
      >
        <MoreVertical className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      </button>
      {menuPanel && typeof document !== 'undefined' ? createPortal(menuPanel, document.body) : null}
    </div>
  );
}
