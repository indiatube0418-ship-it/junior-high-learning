'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useUserData } from '@/lib/useUserData';
import { Pet } from '@/components/Pet';
import { QuestDaily } from '@/components/QuestDaily';
import { ProgressRing } from '@/components/ProgressRing';
import { TopBar } from '@/components/TopBar';
import { checkDailyReminders } from '@/lib/game';

function HomeContent() {
  const { userData, claimQuest } = useUserData();
  const today = new Date().toISOString().split('T')[0];

  if (!userData) {
    return <div className="flex-1 flex items-center justify-center"><div className="text-2xl">載入中...</div></div>;
  }

  const reminders = checkDailyReminders(userData, today);
  const overallProgress = userData.answerRecords.length > 0 
    ? userData.answerRecords.filter(r => r.isCorrect).length / userData.answerRecords.length
    : 0;

  const handleClaimQuest = (id: string) => {
    claimQuest(id);
  };

  const inventory = userData.inventory;
  const pet = userData.pet;
  const hasFood = inventory.food > 0;

  return (
    <>
      <TopBar title="歡迎回來！" />
      <div className="p-4 space-y-6 pb-20 min-h-screen bg-[var(--bg)] text-[var(--text)]">
        {/* 問候與提醒 */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">小學伴：{pet.name}</h2>
          {reminders.length > 0 && (
            <p className="text-[var(--accent)] bg-[var(--accent)]/10 p-3 rounded-xl">{reminders[0]}</p>
          )}
        </div>

        {/* 進度與寵物 */}
        <div className="card grid grid-cols-3 gap-4 items-center p-6">
          <ProgressRing progress={overallProgress} />
          <div className="col-span-2 space-y-1 text-center">
            <p className="text-3xl font-bold text-[var(--primary)]">{Math.round(overallProgress * 100)}%</p>
            <p className="text-sm text-[var(--muted)]">總正確率</p>
          </div>
        </div>

        {/* 今日任務 */}
        <QuestDaily quests={userData.dailyQuests} onClaim={handleClaimQuest} />

        {/* 寵物狀態 */}
        <div className="card p-6 text-center">
          <Pet
            kind={pet.kind}
            mood={pet.mood}
            level={pet.level}
            accessory={pet.accessory}
            scene={pet.scene}
          />
          <div className="space-y-1 mt-4">
            <p>飢餓：{pet.hunger}/100</p>
            <p>心情：{pet.mood}/100</p>
            <div className="flex gap-2 justify-center pt-4">
              <Link 
                href="/pet" 
                className={`flex-1 btn ${hasFood ? 'btn-primary' : 'btn-disabled opacity-50 cursor-not-allowed bg-gray-400 border-gray-400 text-gray-500'}`}
              >
                餵食 {hasFood ? '' : '(無飼料，先練習！)'}
              </Link>
            </div>
          </div>
        </div>

        {/* 快速入口 */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/review" className="card p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-xl mb-2">一鍵複習</h3>
            <p className="text-[var(--muted)]">錯題 + 不熟題</p>
          </Link>
          <Link href="/learn" className="card p-8 text-center">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="font-bold text-xl mb-2">繼續學習</h3>
            <p className="text-[var(--muted)]">國一數學整數運算</p>
          </Link>
        </div>

        <Link href="/map" className="block mx-4 btn btn-primary text-center">
          🗺️ 進入闖關地圖
        </Link>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div>載入中...</div></div>}>
      <HomeContent />
    </Suspense>
  );
}
