/**
 * 主題系統：6套主題，全部預設開放
 * CSS變數 + html data-theme，由 globals.css 定義變數
 */

import type { ThemeId, ThemeDef } from './types';

export const THEME_LIST: { id: ThemeId; name: string; emoji: string; description: string }[] = [
  { id: 'japanese', name: '日系可愛粉彩風', emoji: '🌸', description: '櫻花粉嫩、圓潤舒適' },
  { id: 'korean', name: '韓系極簡手帳風', emoji: '☕', description: '米色奶茶、乾淨圓角、文具感' },
  { id: 'american', name: '美式復古漫畫風', emoji: '🥤', description: '紅藍黃原色、大膽粗黑描邊' },
  { id: 'lolita', name: '蘿莉塔甜美風', emoji: '🎀', description: '粉紅蕾絲、緞帶愛心、健康可愛' },
  { id: 'cyber', name: '賽博朋克霓虹風', emoji: '💻', description: '深色霓虹、掃描線、glitch點綴' },
  { id: 'anime', name: '日漫網點風格', emoji: '🗨️', description: '黑白screentone、集中線、粗框分格' },
];

export const VALID_THEMES: ThemeId[] = THEME_LIST.map(t => t.id);

export const themes: Record<ThemeId, ThemeDef> = {
  japanese: {
    cssVars: {
      '--bg': '#fdf2f8',
      '--card': '#ffffff',
      '--primary': '#ec4899',
      '--fg': '#881337',
    },
  },
  korean: {
    cssVars: {
      '--bg': '#fef7e0',
      '--card': '#ffffff',
      '--primary': '#a78bfa',
      '--fg': '#4a5568',
    },
  },
  american: {
    cssVars: {
      '--bg': '#fef3c7',
      '--card': '#ffffffff',
      '--primary': '#ef4444',
      '--fg': '#1f2937',
    },
  },
  lolita: {
    cssVars: {
      '--bg': '#fdf4ff',
      '--card': '#ffffff',
      '--primary': '#f472b6',
      '--fg': '#7c2d58',
    },
  },
  cyber: {
    cssVars: {
      '--bg': '#0f0f23',
      '--card': '#1a1a2e',
      '--primary': '#00f5ff',
      '--fg': '#f8fafc',
    },
  },
  anime: {
    cssVars: {
      '--bg': '#fafafa',
      '--card': '#ffffff',
      '--primary': '#ef4444',
      '--fg': '#111827',
    },
  },
};

export const DEFAULT_THEME: ThemeId = 'japanese';

export function normalizeThemeId(x: unknown): ThemeId {
  const str = String(x).toLowerCase().trim();
  if (VALID_THEMES.includes(str as ThemeId)) {
    return str as ThemeId;
  }
  const oldMap: Record<string, ThemeId> = {
    campus: 'japanese',
    adventure: 'japanese',
    focus: 'japanese',
    sakura: 'japanese',
    math: 'japanese',
  };
  return oldMap[str] ?? DEFAULT_THEME;
}

export function applyTheme(id: ThemeId): void {
  if (typeof document === 'undefined') return;
  // 清除舊 inline CSS 變數
  Array.from(document.documentElement.style).forEach(prop => {
    if (prop.startsWith('--')) {
      document.documentElement.style.removeProperty(prop);
    }
  });
  // 只設定 data-theme，變數由 globals.css 提供
  document.documentElement.dataset.theme = id;
}
