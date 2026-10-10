/**
 * 主題系統：5套主題，CSS變數 + html data-theme
 * 解鎖條件：預設campus，其他依進度(Phase2實作)
 */

import type { ThemeId, ThemeDef, UserData, AnswerRecord } from './types';

export const themes: Record<ThemeId, ThemeDef> = {
  campus: {
    name: '清新校園風',
    cssVars: {
      '--bg': '#f0f8ff',
      '--bg2': '#e6f3ff',
      '--card': '#ffffff',
      '--bg-card': '#ffffff',
      '--fg': '#1e293b',
      '--text': '#1e293b',
      '--muted': '#64748b',
      '--primary': '#3b82f6',
      '--primary-fg': '#ffffff',
      '--primary-light': '#93c5fd',
      '--primary-dark': '#2563e0',
      '--accent': '#10b981',
      '--border': '#e2e8f0',
      '--radius': '1rem',
      '--font': 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      '--font-family': 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      '--pet-body': '#f6c28b',
      '--pet-accent': '#3b82f6',
      '--pet-blush': '#ffb6c1',
      '--pet-nose': '#8b4513',
    },
    petVariants: { body: 'fill-[var(--pet-body)]', eye: 'fill-white', accent: 'fill-[var(--pet-accent)]' },
  },
  adventure: {
    name: '輕遊戲冒險風',
    cssVars: {
      '--bg': '#fef3c7',
      '--bg2': '#fde68a',
      '--card': '#fefce8',
      '--bg-card': '#fefce8',
      '--fg': '#92400e',
      '--text': '#92400e',
      '--muted': '#a78b4e',
      '--primary': '#f59e0b',
      '--primary-fg': '#7c2d12',
      '--primary-light': '#feb21f',
      '--primary-dark': '#ca7600',
      '--accent': '#059669',
      '--border': '#fcd34d',
      '--radius': '1.5rem',
      '--font': 'system-ui',
      '--font-family': 'system-ui',
      '--pet-body': '#f59e0b',
      '--pet-accent': '#ea580c',
      '--pet-blush': '#ffb6c1',
      '--pet-nose': '#8b4513',
    },
    petVariants: { body: 'fill-[var(--pet-body)] stroke-[var(--pet-accent)]', eye: 'fill-amber-200', accent: 'fill-[var(--pet-accent)]' },
  },
  focus: {
    name: '暗色專注風',
    cssVars: {
      '--bg': '#0f0f23',
      '--bg2': '#1a1a2e',
      '--card': '#1a1a2e',
      '--bg-card': '#1a1a2e',
      '--fg': '#f8fafc',
      '--text': '#f8fafc',
      '--muted': '#94a3b8',
      '--primary': '#6366f1',
      '--primary-fg': '#ffffff',
      '--primary-light': '#a5a7ff',
      '--primary-dark': '#4f52de',
      '--accent': '#10b981',
      '--border': '#334155',
      '--radius': '0.75rem',
      '--font': 'ui-monospace',
      '--font-family': 'ui-monospace',
      '--pet-body': '#6b7280',
      '--pet-accent': '#6366f1',
      '--pet-blush': '#ffb6c1',
      '--pet-nose': '#8b4513',
    },
    petVariants: { body: 'fill-[var(--pet-body)]', eye: 'fill-cyan-300', accent: 'fill-[var(--pet-accent)]' },
  },
  sakura: {
    name: '季節櫻花風',
    cssVars: {
      '--bg': '#fdf2f8',
      '--bg2': '#fce7f3',
      '--card': '#ffffff',
      '--bg-card': '#ffffff',
      '--fg': '#881337',
      '--text': '#881337',
      '--muted': '#be185d',
      '--primary': '#ec4899',
      '--primary-fg': '#ffffff',
      '--primary-light': '#f9a8d4',
      '--primary-dark': '#be185d',
      '--accent': '#8b5cf6',
      '--border': '#fbcfe8',
      '--radius': '2rem',
      '--font': 'system-ui',
      '--font-family': 'system-ui',
      '--pet-body': '#fef3f2',
      '--pet-accent': '#ec4899',
      '--pet-blush': '#ffb6c1',
      '--pet-nose': '#8b4513',
    },
    petVariants: { body: 'fill-[var(--pet-body)]', eye: 'fill-pink-200', accent: 'fill-[var(--pet-accent)]' },
  },
  math: {
    name: '科目數學風',
    cssVars: {
      '--bg': '#f8fafc',
      '--bg2': '#e2e8f0',
      '--card': '#ffffff',
      '--bg-card': '#ffffff',
      '--fg': '#1e293b',
      '--text': '#1e293b',
      '--muted': '#475569',
      '--primary': '#0ea5e9',
      '--primary-fg': '#ffffff',
      '--primary-light': '#38bdf8',
      '--primary-dark': '#0077b6',
      '--accent': '#8b5cf6',
      '--border': '#cbd5e1',
      '--radius': '0.5rem',
      '--font': 'ui-monospace, SFMono-Regular',
      '--font-family': 'ui-monospace, SFMono-Regular',
      '--pet-body': '#f1f5f9',
      '--pet-accent': '#0ea5e9',
      '--pet-blush': '#ffb6c1',
      '--pet-nose': '#8b4513',
    },
    petVariants: { body: 'fill-[var(--pet-body)]', eye: 'fill-blue-200', accent: 'fill-[var(--pet-accent)]' },
  },
};

export const unlockRequirement: Record<ThemeId, string> = {
  campus: '預設解鎖',
  adventure: '預設解鎖',
  focus: '預設解鎖',
  sakura: '答對 30 題',
  math: '完成任一單元',
};

export function isThemeUnlocked(themeId: ThemeId, userData: UserData): boolean {
  switch (themeId) {
    case 'campus':
    case 'adventure':
    case 'focus':
      return true;
    case 'sakura': {
      const correctCount = userData.answerRecords.filter((r: AnswerRecord) => r.isCorrect).length;
      return correctCount >= 30 || userData.unlockedThemes.includes(themeId);
    }
    case 'math':
      return userData.unlockedUnits.length >= 1 || userData.unlockedThemes.includes(themeId);
    default:
      return false;
  }
}

export function applyTheme(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;
  const theme = themes[themeId];
  document.documentElement.dataset.theme = themeId;
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}
