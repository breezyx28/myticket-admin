import { cn } from '@/lib/utils';

export function StatBubble({
  label,
  value,
  color = 'bg-ink text-white',
  className,
}: {
  label: string;
  value: string;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-[28px] px-6 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
        color,
        className
      )}
    >
      <span className="text-[12px] font-medium opacity-70">{label}</span>
      <span className="font-mono text-[32px] font-black leading-none tracking-tight">{value}</span>
    </div>
  );
}
