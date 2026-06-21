/** Theme color tokens accepted by `color_token` on event categories (max 40 chars). */
export type CategoryColorTokenDef = {
  token: string;
  /** Hex used for admin preview swatches only — stored value remains `token`. */
  hex: string;
};

/** Curated tokens aligned to MyTicket theme + common semantic aliases. */
export const CATEGORY_COLOR_TOKENS: readonly CategoryColorTokenDef[] = [
  { token: 'primary', hex: '#ff6b4a' },
  { token: 'secondary', hex: '#555555' },
  { token: 'accent', hex: '#3355ff' },
  { token: 'success', hex: '#4dffc3' },
  { token: 'warning', hex: '#f4a05a' },
  { token: 'danger', hex: '#cc4a2e' },
  { token: 'info', hex: '#a8c9f0' },
  { token: 'coral', hex: '#ff6b4a' },
  { token: 'coral-light', hex: '#ffb8a8' },
  { token: 'coral-dark', hex: '#cc4a2e' },
  { token: 'rose', hex: '#fb7185' },
  { token: 'pink', hex: '#f472b6' },
  { token: 'red', hex: '#ef4444' },
  { token: 'orange', hex: '#fb923c' },
  { token: 'amber', hex: '#f4a05a' },
  { token: 'yellow', hex: '#facc15' },
  { token: 'lemon', hex: '#f5e642' },
  { token: 'lemon-light', hex: '#fdf4a0' },
  { token: 'lemon-dark', hex: '#c9bc1a' },
  { token: 'lime', hex: '#baff39' },
  { token: 'green', hex: '#22c55e' },
  { token: 'emerald', hex: '#10b981' },
  { token: 'mint', hex: '#4dffc3' },
  { token: 'teal', hex: '#14b8a6' },
  { token: 'cyan', hex: '#06b6d4' },
  { token: 'sky', hex: '#a8c9f0' },
  { token: 'blue', hex: '#3b82f6' },
  { token: 'indigo', hex: '#3355ff' },
  { token: 'violet', hex: '#8b5cf6' },
  { token: 'purple', hex: '#a855f7' },
  { token: 'lavender', hex: '#c4b5f4' },
  { token: 'fuchsia', hex: '#d946ef' },
  { token: 'slate', hex: '#64748b' },
  { token: 'gray', hex: '#9ca3af' },
  { token: 'ink', hex: '#0d0d0d' },
  { token: 'ink-60', hex: '#555555' },
  { token: 'white', hex: '#ffffff' },
  { token: 'surface-warm', hex: '#f0ede6' },
  { token: 'surface-tint', hex: '#f5f5f5' },
] as const;

const TOKEN_HEX = new Map(CATEGORY_COLOR_TOKENS.map((entry) => [entry.token, entry.hex]));

const LIGHT_SWATCH_HEX = new Set([
  '#fdf4a0',
  '#f5e642',
  '#baff39',
  '#f0ede6',
  '#f5f5f5',
  '#ffffff',
  '#ffb8a8',
  '#c4b5f4',
  '#a8c9f0',
  '#4dffc3',
  '#facc15',
]);

export function resolveCategoryColorTokenHex(token: string | null | undefined): string {
  const key = token?.trim().toLowerCase();
  if (!key) return '#e5e5e5';
  return TOKEN_HEX.get(key) ?? '#888888';
}

export function isKnownCategoryColorToken(token: string | null | undefined): boolean {
  const key = token?.trim().toLowerCase();
  if (!key) return false;
  return TOKEN_HEX.has(key);
}

export function isLightCategoryColorHex(hex: string): boolean {
  return LIGHT_SWATCH_HEX.has(hex.toLowerCase());
}
