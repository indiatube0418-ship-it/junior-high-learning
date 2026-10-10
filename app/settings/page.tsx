'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '@/lib/useUserData';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { themes, isThemeUnlocked, unlockRequirement } from '@/lib/themes';
import type { ThemeId } from '@/lib/types';
import { storage, createDefaultUserData } from '@/lib/storage';

/**
 * 設定頁：主題切換、寵物改名、備份、重置
 */
export default function SettingsPage() {
  const { userData, setTheme } = useUserData();
  const [petName, setPetName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const themePreviews: Record<ThemeId, { primary: string; card: string }> = {
    campus: { primary: '#3b82f6', card: 'rgba(255,255,255,0.9)' },
    adventure: { primary: '#f59e0b', card: 'rgba(254,252,232,0.9)' },
    focus: { primary: '#6366f1', card: 'rgba(26,26,46,0.9)' },
    sakura: { primary: '#ec4899', card: 'rgba(255,255,255,0.9)' },
    math: { primary: '#0ea5e9', card: 'rgba(255,255,255,0.95)' },
  };

  useEffect(() => {
    if (userData?.pet.name) setPetName(userData.pet.name);
  }, [userData]);

  const savePetName = () => {
    if (userData && petName.trim()) {
      const newData = { ...userData, pet: { ...userData.pet, name: petName.trim() } };
      storage.setUserData(newData);
      window.location.reload();
    }
  };

  const exportData = () => {
    if (userData) {
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'learning-data-backup.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported: any = JSON.parse(ev.target?.result as string);
          storage.setUserData(imported);
          window.location.reload();
        } catch {}
      };
      reader.readAsText(file);
    }
  };

  const resetData = () => {
    storage.setUserData(createDefaultUserData());
    window.location.reload();
  };

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--fg)]">載入中...</div>;
  }

  const currentTheme = userData.currentTheme;

  return (
    <>
      <TopBar title="設定" />
      <div className="p-4 pb-20 bg-[var(--bg)] text-[var(--fg)] space-y-8">
        {/* 寵物改名 */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">寵物名稱</h2>
          <input
            className="w-full p-3 border-border rounded-xl bg-bg2 mb-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="輸入寵物名"
          />
          <button className="w-full btn btn-primary" onClick={savePetName}>
            儲存
          </button>
        </div>

        {/* 主題切換 */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">主題樣式</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(themes).map(([id, theme]) => {
              const tid = id as ThemeId;
              const unlocked = isThemeUnlocked(tid, userData);
              return (
                <button
                  key={id}
                  className="group relative p-4 border-2 border-transparent rounded-xl hover:border-[var(--primary)] transition-all bg-bg2 shadow-sm overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-75"
                  style={{ backgroundColor: themePreviews[tid].card }}
                  onClick={() => unlocked && setTheme(tid)}
                  disabled={!unlocked}
                >
                  {!unlocked && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs z-10">
                      <span className="text-lg mb-1">🔒</span>
                      <span>{unlockRequirement[tid]}</span>
                    </div>
                  )}
                  <div
                    className="w-12 h-12 mx-auto mb-2 rounded-full shadow-md flex-shrink-0"
                    style={{ backgroundColor: themePreviews[tid].primary }}
                  />
                  <div className="font-bold text-sm text-[var(--fg)] text-center">{theme.name}</div>
                  {unlocked && currentTheme === tid && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--accent)] text-[var(--primary-fg)] rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="text-center text-sm text-[var(--muted)] mt-4">
            已解鎖主題可直接切換
          </div>
        </div>

        {/* 資料備份 */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">資料備份</h2>
          <div className="space-y-3">
            <button className="w-full btn bg-blue-500 hover:brightness-95 border-blue-500 text-white" onClick={exportData}>
              匯出 JSON
            </button>
            <label className="w-full btn bg-gray-500 hover:brightness-95 border-gray-500 text-white cursor-pointer block text-center">
              匯入 JSON
              <input type="file" accept=".json" className="hidden" onChange={importData} />
            </label>
          </div>
        </div>

        {/* 重置 */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-[calc(var(--radius)*1.5)] shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-800">重置所有資料</h2>
          <p className="text-[var(--muted)] mb-4">這會清除所有進度、寵物、物品，不可復原！</p>
          {showResetConfirm ? (
            <div className="space-y-3">
              <p className="font-bold text-red-700">確定要重置嗎？</p>
              <div className="flex gap-3">
                <button className="flex-1 btn bg-red-500 hover:brightness-95 border-red-500 text-white font-bold" onClick={resetData}>
                  確認重置
                </button>
                <button className="flex-1 btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button className="w-full btn bg-red-500 hover:brightness-95 border-red-500 text-white font-bold" onClick={() => setShowResetConfirm(true)}>
              確認重置
            </button>
          )}
        </div>
      </div>
      <BottomNav active="settings" />
    </>
  );
}
