'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useUserData } from '@/lib/useUserData';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { getUnitProgress } from '@/lib/questions';
import chapterData from '@/data/math-grade1-sem1-chapter1.json';
import Link from 'next/link';
import type { Chapter, Unit } from '@/lib/types';

function MapContent() {
  const { userData, unlockUnit } = useUserData();
  const searchParams = useSearchParams();

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--fg)]">載入中...</div>;
  }

  const chapter: Chapter = chapterData.chapter;
  const units: Unit[] = chapter.units;

  // 計算單元狀態
  const getUnitState = (unitId: string) => {
    const progress = getUnitProgress(unitId, userData);
    // 簡化：假設 answered 從 progress 推斷，實際需計算但為狀態用正確率
    const unitQs = chapter.units.find(u => u.id === unitId);
    if (!unitQs) return 'locked';
    const isFirstUnit = units[0].id === unitId;
    const unlocked = userData.unlockedUnits.includes(unitId) || isFirstUnit;
    // 模擬 passed：正確率高
    const passed = progress.correctRate >= 0.8;
    if (passed) return 'passed';
    if (unlocked) return 'unlocked';
    return 'locked';
  };

  const handleNodeClick = (unitId: string) => {
    const state = getUnitState(unitId);
    if (state === 'unlocked' || state === 'passed') {
      // 已解鎖可進入
    } else if (units[0].id === unitId) {
      unlockUnit(unitId);
    }
  };

  return (
    <>
      <TopBar title="學習地圖" />
      <div className="p-4 pb-[calc(96px+env(safe-area-inset-bottom))] min-h-screen bg-[var(--bg)] text-[var(--fg)] overflow-auto">
        <h1 className="text-2xl font-bold text-center mb-8">{chapter.title}</h1>

        {/* SVG 直式蜿蜒路徑 */}
        <div className="relative w-full h-[600px] mx-auto border rounded-2xl overflow-hidden bg-[var(--bg-card)] mb-8">
          <svg viewBox="0 0 400 650" className="w-full h-full">
            {/* 直式蜿蜒路徑 */}
            <path
              d="M200 40 L 120 90 L 280 140 L 120 190 L 280 240 L 120 290 L 280 340"
              stroke="var(--primary)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.4"
              strokeDasharray="20 15"
            />

            {/* 單元節點 */}
            {units.map((unit, idx) => {
              const x = idx % 2 === 0 ? 120 : 280;
              const y = 60 + idx * 80;
              const state = getUnitState(unit.id);
              const isActionable = state === 'unlocked' || state === 'passed';
              const nodeCls = state === 'passed'
                ? 'fill-[var(--accent)] stroke-[var(--accent)] stroke-width-6'
                : state === 'unlocked'
                ? 'fill-[var(--primary)] stroke-[var(--primary-dark)] stroke-width-6'
                : 'fill-[var(--border)] stroke-[var(--muted)] stroke-width-4';
              return (
                <g key={unit.id}>
                  {/* 節點圓 */}
                  <circle cx={x} cy={y} r="35" className={`transition-all duration-500 drop-shadow-md ${nodeCls}`} />
                  {/* 序號 */}
                  <text x={x} y={y + 8} textAnchor="middle" className="fill-[var(--fg)] font-bold text-[20px] drop-shadow-sm">
                    {idx + 1}
                  </text>
                  {/* 單元名稱 */}
                  <text
                    x={x}
                    y={y + 35}
                    textAnchor="middle"
                    className="fill-[var(--fg)] font-semibold text-[14px] drop-shadow-sm leading-tight max-w-[120px] truncate"
                  >
                    {unit.title}
                  </text>
                  {/* 進入按鈕 */}
                  <foreignObject x={x - 50} y={y + 50} width="100" height="70">
                    <div className="w-full h-full flex items-center justify-center p-2">
                      {isActionable ? (
                        <Link
                          href={`/learn?unit=${unit.id}`}
                          className="block w-full p-2.5 text-center bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--primary-fg)] text-xs font-bold rounded-xl shadow-md transition-all no-underline flex flex-col items-center gap-1 h-full justify-center"
                          onClick={() => handleNodeClick(unit.id)}
                        >
                          <span className="text-[22px]">
                            {state === 'passed' ? '⭐' : '🚀'}
                          </span>
                          <span>{state === 'passed' ? '已通過' : '開始學習'}</span>
                        </Link>
                      ) : (
                        <div className="text-center p-2.5 text-xs text-[var(--muted)] font-medium flex flex-col items-center justify-center h-full">
                          <span className="text-[26px]">🔒</span>
                          <span>鎖定</span>
                        </div>
                      )}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 練習模式按鈕 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {(['basic', 'advanced', 'exam'] as const).map((mode) => {
            const labels = { basic: '基礎練習', advanced: '進階題', exam: '歷年真題' } as Record<string, string>;
            const icons = { basic: '📖', advanced: '📚', exam: '📝' } as Record<string, string>;
            return (
              <Link
                key={mode}
                href={`/practice?mode=${mode}&unit=${units[0].id}`}
                className="btn btn-secondary p-6 rounded-xl h-auto flex flex-col items-center gap-2 text-sm shadow-lg hover:shadow-xl transition-all flex-1"
              >
                <span className="text-3xl">{icons[mode]}</span>
                {labels[mode]}
              </Link>
            );
          })}
        </div>

        {/* 提示 */}
        <div className="text-center text-sm opacity-75 bg-[var(--bg2)] p-4 rounded-xl border border-[var(--border)]/50">
          提示：單元基礎題正確率 ≥80% 且答 ≥4 題，即可解鎖下一關！
        </div>
      </div>
      <BottomNav />
    </>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div>載入地圖...</div>}>
      <MapContent />
    </Suspense>
  );
}
