'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '@/lib/useUserData';
import { THEME_LIST } from '@/lib/themes';
import type { ThemeId } from '@/lib/types';

/**
 * 主題切換器元件
 * compact=true：小按鈕 + 下拉選單；compact=false：6 張預覽卡片網格
 */
interface ThemeSwitcherProps {
  compact?: boolean;
}

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { userData, setTheme } = useUserData();
  const [open, setOpen] = useState(false);
  const currentTheme = userData?.currentTheme ?? 'japanese';

  useEffect(() => {
    const handleClickOutside = () => setOpen(false);
    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open]);

  const currentThemeInfo = THEME_LIST.find(t => t.id === currentTheme);

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          className="btn h-12 px-3 flex items-center gap-2 text-base"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <span className="text-2xl">{currentThemeInfo?.emoji ?? '🎨'}</span>
          主題
        </button>
        {open && (
          <div className="absolute bottom-full left-0 mb-2 w-60 bg-card rounded-2xl shadow-2xl border border-border py-2 z-50 flex flex-col overflow-hidden">
            {THEME_LIST.map((theme) => (
              <button
                key={theme.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 w-full text-left transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => {
                  setTheme(theme.id);
                  setOpen(false);
                }}
              >
                <span className="text-2xl flex-shrink-0">{theme.emoji}</span>
                <span className="font-medium">{theme.name}</span>
                {theme.id === currentTheme && (
                  <span className="ml-auto text-primary font-bold text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {THEME_LIST.map((theme) => {
        const isCurrent = theme.id === currentTheme;
        return (
          <button
            key={theme.id}
            className={`card p-6 flex flex-col items-center gap-3 text-center group hover:shadow-xl transition-all relative overflow-hidden ${
              isCurrent ? 'ring-4 ring-primary/50 shadow-2xl scale-[1.02]' : ''
            }`}
            onClick={() => setTheme(theme.id)}
          >
            <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 transition-all mx-auto">
              {theme.emoji}
            </div>
            <div className="space-y-1">
              <div className="font-bold text-lg leading-tight">{theme.name}</div>
              <div className="text-sm text-[var(--muted)]">{theme.description}</div>
            </div>
            {isCurrent && (
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary text-primary-fg rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
