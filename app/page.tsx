'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useUserData } from '@/lib/useUserData';
import { Pet } from '@/components/Pet';
import { questions, getUnitProgress, books, findNextUnit, findUnit, isUnitUnlocked } from '@/lib/questions';
import type { Unit, UserData } from '@/lib/types';

function getUnitAnsweredAndCorrect(unitId: string, userData: UserData): { answered: number; correct: number } {
  const unitQs = questions.filter((q) => q.unitId === unitId);
  const latestRecords: Record<string, boolean> = {};
  for (const record of [...userData.answerRecords].reverse()) {
    if (unitQs.some((q) => q.id === record.questionId) && !(record.questionId in latestRecords)) {
      latestRecords[record.questionId] = record.isCorrect;
    }
  }
  const answered = Object.keys(latestRecords).length;
  const correct = Object.values(latestRecords).filter(Boolean).length;
  return { answered, correct };
}

function HomeContent() {
  const { userData, claimQuest } = useUserData();

  if (!userData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-2xl">載入中...</div>
      </div>
    );
  }

  const nextUnit = findNextUnit(userData);
  const lastBook = books[books.length - 1];
  const lastChapter = lastBook.chapters[lastBook.chapters.length - 1];
  const lastUnit = lastChapter.units[lastChapter.units.length - 1];
  const focus = nextUnit ? findUnit(nextUnit.id) : findUnit(lastUnit.id);
  const units: Unit[] = focus?.chapter.units ?? [];
  const allPassed = nextUnit === null;
  const pet = userData.pet;

  // 計算一鍵複習數量（錯題 + 不熟）
  const reviewCount = Object.values(userData.questionMarks).filter((mark: any) => mark?.wrong || mark?.unsure).length;

  return (
    <div className="flex min-h-[calc(100dvh-var(--bottom-nav-offset))] flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* 頂部問候 */}
      <div className="p-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold">歡迎回來！</h1>
        <p className="text-lg text-[var(--muted)]">小學伴：{pet.name}</p>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* 繼續學習主卡 */}
        <div className="card p-6 md:p-8 text-center relative overflow-hidden">
          {allPassed ? (
            <>
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4">全章節通過！</h2>
              <p className="text-[var(--muted)] mb-6">準備挑戰更高難度吧！</p>
              <Link
                href="/practice?mode=exam"
                className="block w-full btn btn-primary text-xl py-5 shadow-lg"
              >
                挑戰模擬考
              </Link>
            </>
          ) : nextUnit ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10" />
              <h2 className="text-2xl font-bold mb-6 relative z-10">{nextUnit.title}</h2>
              <div className="w-full bg-[var(--bg2)] rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="bg-[var(--primary)] h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(questions.filter((q) => q.unitId === nextUnit!.id).length > 0
                      ? getUnitAnsweredAndCorrect(nextUnit!.id, userData).correct /
                        questions.filter((q) => q.unitId === nextUnit!.id).length
                      : 0) * 100
                      }%`,
                  }}
                />
              </div>
              <p className="text-[var(--muted)] mb-8 relative z-10">
                {getUnitAnsweredAndCorrect(nextUnit.id, userData).correct}/
                {questions.filter((q) => q.unitId === nextUnit.id).length} 已答對
              </p>
              <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                <Link
                  href={`/learn?unit=${nextUnit.id}`}
                  className="flex-1 btn btn-primary text-lg py-4 shadow-md"
                >
                  ▶ 繼續學習
                </Link>
                <Link
                  href={`/practice?mode=basic&unit=${nextUnit.id}`}
                  className="btn btn-secondary px-8 py-4"
                >
                  直接練習
                </Link>
              </div>
            </>
          ) : null}
        </div>

        {/* 課程路徑 */}
        <div>
          <h3 className="section-title mb-4">課程路徑{focus ? ` · ${focus.book.title} ${focus.chapter.title}` : ''}</h3>
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/map?book=${book.id}`}
                className="shrink-0 rounded-full px-3 py-1 text-sm font-bold no-underline"
                style={{ backgroundColor: 'var(--bg2)', color: 'var(--fg)' }}
              >
                {book.title}
              </Link>
            ))}
          </div>
          <div className="space-y-3">
            {units.map((unit, idx) => {
              const uid = unit.id;
              const isUnlocked = isUnitUnlocked(uid, userData);
              const prog = getUnitProgress(uid, userData);
              const { answered, correct } = getUnitAnsweredAndCorrect(uid, userData);
              const correctRate = answered > 0 ? correct / answered : 0;
              const passed = correctRate >= 0.8 && answered >= 4;
              const totalQs = questions.filter((q) => q.unitId === uid).length;
              const progressPct = totalQs > 0 ? (correct / totalQs) * 100 : 0;
              const statusIcon = passed ? '✅' : isUnlocked ? '▶' : '🔒';
              const statusText = passed ? '已通過' : isUnlocked ? '進行中' : '未解鎖';
              return (
                <Link
                  key={uid}
                  href={isUnlocked ? `/learn?unit=${uid}` : '#'}
                  className={`card p-4 flex items-center gap-4 transition-all ${
                    !isUnlocked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl shrink-0">{statusIcon}</span>
                      <h4 className="font-bold text-lg truncate">{unit.title}</h4>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[var(--primary)] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(progressPct, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1.5">
                      {correct}/{totalQs} {statusText}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 今日任務精簡版 */}
        <div className="card p-4">
          <h3 className="section-title mb-4">📋 今日任務</h3>
          <div className="space-y-3">
            {userData.dailyQuests.map((quest) => {
              const progressPct = (quest.progress / quest.target) * 100;
              const canClaim = quest.progress >= quest.target && !quest.completed;
              return (
                <div key={quest.id} className="flex items-center justify-between p-3 bg-[var(--bg2)]/50 rounded-xl border border-[var(--border)]/50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold truncate">{quest.title}</p>
                      <p className="text-xs text-[var(--muted)]">{quest.progress}/{quest.target}</p>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0 ml-4 gap-2">
                    {quest.completed ? (
                      <span className="px-3 py-1.5 text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 rounded-lg flex items-center gap-1">
                        ✓ 已領取
                      </span>
                    ) : canClaim ? (
                      <button
                        className="btn btn-primary text-sm px-4 py-1.5 whitespace-nowrap shadow-md hover:shadow-lg"
                        onClick={() => claimQuest(quest.id)}
                      >
                        領取飼料
                      </button>
                    ) : (
                      <div className="w-20 h-2 bg-[var(--border)] rounded-full overflow-hidden ml-2">
                        <div
                          className="bg-[var(--primary)] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 寵物小卡 + 一鍵複習 */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/pet" className="card p-4 text-center hover:shadow-lg transition-all">
            <div className="w-24 aspect-square mx-auto mb-3">
              <Pet
                kind={pet.kind}
                mood={pet.mood}
                hunger={pet.hunger}
                level={pet.level}
                accessory={pet.accessory}
                scene={pet.scene || 'room'}
                size={96}
              />
            </div>
            <h4 className="font-bold text-lg mb-1">{pet.name}</h4>
            <p className="text-sm text-[var(--muted)]">點擊照顧我吧！</p>
          </Link>
          <Link href="/review" className="card p-4 text-center hover:shadow-lg transition-all flex flex-col items-center justify-center">
            <div className="text-4xl mb-3">🎯</div>
            <h4 className="font-bold text-xl mb-2">一鍵複習</h4>
            <p className="text-sm text-[var(--muted)]">錯題＋不熟 ({reviewCount})</p>
          </Link>
        </div>

        {/* 頁尾連結 */}
        <Link
          href="/dashboard"
          className="block mx-4 btn btn-secondary text-center shadow-md hover:shadow-lg"
        >
          📊 學習報告
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div>載入中...</div></div>}>
      <HomeContent />
    </Suspense>
  );
}
