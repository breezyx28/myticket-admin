import { describe, expect, it } from 'vitest';
import { formatSarAxis, formatSarCompact } from '@/lib/formatSar';

describe('formatSarCompact', () => {
  it('formats sub-thousands with grouping', () => {
    expect(formatSarCompact(0)).toBe('0 SAR');
    expect(formatSarCompact(950)).toBe('950 SAR');
  });

  it('uses K suffix with optional decimal', () => {
    expect(formatSarCompact(1000)).toBe('1K SAR');
    expect(formatSarCompact(1200)).toBe('1.2K SAR');
    expect(formatSarCompact(428_000)).toBe('428K SAR');
  });

  it('uses M suffix', () => {
    expect(formatSarCompact(1_000_000)).toBe('1M SAR');
    expect(formatSarCompact(12_400_000)).toBe('12.4M SAR');
  });
});

describe('formatSarAxis', () => {
  it('strips SAR suffix for chart ticks', () => {
    expect(formatSarAxis(428_000)).toBe('428K');
    expect(formatSarAxis(950)).toBe('950');
  });
});
