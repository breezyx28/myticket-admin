/**
 * Compact SAR display for UI: `900 SAR`, `1K SAR`, `1.2K SAR`, `428K SAR`, `1M SAR`, `12.4M SAR`.
 */
export function formatSarCompact(sar: number): string {
  if (!Number.isFinite(sar) || sar < 0) return '—';
  const n = Math.round(sar);
  if (n === 0) return '0 SAR';
  if (n < 1000) return `${n.toLocaleString('en-US')} SAR`;

  if (n < 1_000_000) {
    const k = n / 1000;
    const rounded = Math.round(k * 10) / 10;
    const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '');
    return `${str}K SAR`;
  }

  const m = n / 1_000_000;
  const rounded = Math.round(m * 10) / 10;
  const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '');
  return `${str}M SAR`;
}

/** Shorter tick label for charts (drops trailing ` SAR`). */
export function formatSarAxis(sar: number): string {
  return formatSarCompact(sar).replace(/\s*SAR$/, '');
}
