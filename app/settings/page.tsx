'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '@/lib/useUserData';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { storage, createDefaultUserData } from '@/lib/storage';

/**
 * 設定頁：主題切換、寵物改名、學習報告、資料備份、重置
 * 所有主題預設開放，無解鎖條件
 */
export default function SettingsPage() {
  const { userData } = useUserData();
  const [petName, setPetName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
      a.download = '學習資料備份.json';
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
          const imported = JSON.parse(ev.target?.result as string);
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

  return (
    <>
      <TopBar title="設定" />
      <div className="p-4 pb-20 bg-[var(--bg)] text-[var(--fg)] space-y-6">
        {/* 學習報告 */}
        <div className="card text-center p-6">
          <a href="/dashboard" className="inline-block btn btn-primary text-lg px-8 py-4 shadow-lg">
            📊 學習報告
          </a>
        </div>

        {/* 寵物改名 */}
        <div className="card">
          <h2 className="section-title mb-4">寵物名稱</h2>
          <input
            className="w-full p-4 border border-[var(--border)] rounded-[calc(var(--radius)*1.25)] bg-[var(--bg-card)] mb-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-all"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="輸入寵物名稱（最多 10 字）"
          />
          <button className="w-full btn btn-primary" onClick={savePetName}>
            儲存名稱
          </button>
        </div>

        {/* 主題切換 */}
        <div className="card">
          <h2 className="section-title mb-6">主題樣式</h2>
          <ThemeSwitcher />
          <p className="text-center text-sm text-[var(--muted)] mt-4">
            點選喜歡的主題即可切換
          </p>
        </div>

        {/* 資料備份 */}
        <div className="card">
          <h2 className="section-title mb-4">資料備份</h2>
          <div className="space-y-3">
            <button className="w-full btn bg-[var(--primary)] hover:brightness-95 text-[var(--primary-fg)]" onClick={exportData}>
              匯出 JSON 備份
            </button>
            <label className="w-full btn bg-[var(--muted)] hover:brightness-95 text-[var(--fg)] cursor-pointer block text-center">
              匯入 JSON 檔案
              <input type="file" accept=".json" className="hidden" onChange={importData} />
            </label>
          </div>
          <p className="text-xs text-[var(--muted)] mt-3 text-center">
            建議定期備份進度，避免遺失
          </p>
        </div>

        {/* 重置資料 */}
        <div className="bg-red-50/80 border-2 border-red-200/80 p-6 rounded-[calc(var(--radius)*1.5)] shadow-xl">
          <h2 className="section-title mb-4 text-red-800">⚠️ 重置所有資料</h2>
          <p className="text-[var(--muted)] mb-6 leading-relaxed">
            這會<strong>永久清除</strong>所有學習進度、寵物狀態、物品與紀錄，不可復原！
          </p>
          {showResetConfirm ? (
            <div className="space-y-4">
              <p className="font-bold text-red-700 text-center bg-red-100 p-3 rounded-xl">
                確定要重置嗎？此動作無法撤銷。
              </p>
              <div className="flex gap-3">
                <button
                  className="flex-1 btn bg-red-500 hover:brightness-95 border-red-500 text-white font-bold shadow-lg"
                  onClick={resetData}
                >
                  確認重置
                </button>
                <button className="flex-1 btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              className="w-full btn bg-red-500 hover:brightness-95 border-red-500 text-white font-bold shadow-lg"
              onClick={() => setShowResetConfirm(true)}
            >
              確認重置所有資料
            </button>
          )}
        </div>
      </div>
      <BottomNav active="settings" />
    </>
  );
}
