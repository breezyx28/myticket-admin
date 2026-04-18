import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type AdminSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Extra top spacing when stacked under another section */
  divider?: boolean;
};

export function AdminSection({ eyebrow, title, description, children, className, divider }: AdminSectionProps) {
  return (
    <section className={cn(divider && 'border-t border-ink-10 pt-10', className)}>
      <header className="mb-6 max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-2 text-[14px] leading-relaxed text-ink-60">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
