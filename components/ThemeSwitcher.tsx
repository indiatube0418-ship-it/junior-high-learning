'use client';

import { useUserData } from '@/lib/useUserData';
import { THEME_LIST } from '@/lib/themes';

/**
 * 主題切換器：6 張預覽卡。只放在設定頁。
 * 首頁不放，避免右上角下拉蓋住選項。
 */
export function ThemeSwitcher() {
  const { userData, setTheme } = useUserData();
  const currentTheme = userData?.currentTheme ?? 'japanese';

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
