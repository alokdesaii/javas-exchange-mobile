// Mirrors brand.css from the web app: light and dark palettes.
const light = {
  deep: '#25165b',   // Javas purple — accent ink, selected states
  signal: '#e8585f',
  flag: '#f2c94c',
  canvas: '#f7f6f8',
  sheet: '#ffffff',
  raised: '#ffffff',
  sunk: '#f1eff4',
  tint: '#eeebf2',
  rule: 'rgba(37,22,91,.08)',
  ruleStrong: 'rgba(37,22,91,.16)',
  ink: '#231f28',
  ink2: '#5b545f',
  ink3: '#8e8791',
  ink4: '#b4aeb8',
  gain: '#1f7a55',
  loss: '#c0414c',
  hero: '#ece7f6',
};

const dark: typeof light = {
  ...light,
  deep: '#9b86d8',   // purple on dark is invisible; the web's --avail lilac takes its role
  canvas: '#141019',
  sheet: '#1b1622',
  raised: '#221c2b',
  sunk: '#100d15',
  tint: '#241e2e',
  rule: 'rgba(255,255,255,.09)',
  ruleStrong: 'rgba(255,255,255,.16)',
  ink: '#efedf1',
  ink2: '#aaa3af',
  ink3: '#817a87',
  ink4: '#5d5665',
  gain: '#4cb98a',
  loss: '#e8757e',
  hero: '#241d36',
};

export type Mode = 'light' | 'dark';
let mode: Mode = 'light';

// One mutable palette everyone imports; setMode swaps its values in place.
export const c = { ...light };
export const setMode = (m: Mode) => { mode = m; Object.assign(c, m === 'dark' ? dark : light); };

// Stylesheets built per mode on first use, so `s.foo` always matches the current palette.
// The app remounts its tree on a mode change so every screen re-reads them.
export function themed<T extends object>(make: () => T): T {
  const cache: Partial<Record<Mode, T>> = {};
  return new Proxy({} as T, { get: (_, k) => (cache[mode] ??= make())[k as keyof T] });
}

export const f = {
  light: 'Outfit_300Light',
  reg: 'Outfit_400Regular',
  med: 'Outfit_500Medium',
  semi: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  mono: 'JetBrainsMono_500Medium',
};

export const t = { meta: 11, label: 12, body: 14, h4: 16, h3: 18, h2: 22, h1: 28, display: 44 };
