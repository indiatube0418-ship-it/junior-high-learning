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

/**
 * 闖關地圖：章節→單元節點，SVG 蜿蜒路徑，狀態顏色區分
 * 目前僅一章，未來擴充多章
 */
function MapContent() {
  const { userData, unlockUnit } = useUserData();
  const searchParams = useSearchParams();

  if (!userData) return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--fg)]">載入中...</div>;

  const chapter: Chapter = chapterData.chapter;
  const units: Unit[] = chapter.units;

  // 計算狀態
  const getUnitState = (unitId: string) => {
    const progress = getUnitProgress(unitId, userData);
    const isFirstUnit = units[0].id === unitId;
    const unlocked = userData.unlockedUnits.includes(unitId) || isFirstUnit;
    const passed = progress.correctRate >= 0.8 && userData.answerRecords.filter(r => r.questionId.startsWith(unitId)).length >= 4;
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
      <div className="p-4 pb-20 min-h-screen bg-[var(--bg)] text-[var(--fg)] overflow-auto">
        <h1 className="text-2xl font-bold text-center mb-8">{chapter.title}</h1>
        
        {/* SVG 地圖：簡單蜿蜒路徑 */}
        <div className="relative w-full h-[500px] mx-auto border rounded-2xl overflow-hidden bg-[var(--bg-card)]">
          <svg viewBox="0 0 500 400" className="w-full h-full">
            {/* 蜿蜒路徑 */}
            <path 
              d="M60 200 Q110 150, 170 200 T280 200 T410 200" 
              stroke="var(--primary)" 
              strokeWidth="12" 
              fill="none" 
              opacity="0.3"
              strokeDasharray="15 10"
              strokeLinecap="round"
            />
            
            {/* 節點 */}
            {units.map((unit, idx) => {
              const x = 60 + idx * 90;
              const y = 200;
              const state = getUnitState(unit.id);
              const isActionable = state === 'unlocked' || state === 'passed';
              const nodeCls = state === 'passed' 
                ? 'fill-[var(--accent)] stroke-[var(--accent)] stroke-[5]' 
                : state === 'unlocked' 
                  ? 'fill-[var(--primary)] stroke-[var(--primary-dark)] stroke-[5]' 
                  : 'fill-[var(--border)] stroke-[var(--muted)] stroke-[3]';
              return (
                <g key={unit.id}>
                  <circle cx={x} cy={y} r="30" className={`transition-all duration-300 ${nodeCls}`} />
                  <text x={x} y={y + 8} textAnchor="middle" className="fill-[var(--fg)] font-bold text-[18px] drop-shadow-sm">{idx + 1}</text>
                  <text 
                    x={x} 
                    y={y + 55} 
                    textAnchor="middle" 
                    className="fill-[var(--fg)] font-medium text-[14px] leading-tight max-w-[140px] truncate"
                    style={{ maxWidth: '140px' }}
                  >
                    {unit.title}
                  </text>
                  <foreignObject x={x - 50} y={y + 75} width="100" height="60">
                    <div className="w-full h-full flex items-center justify-center">
                      {isActionable ? (
                        <Link
                          href={`/learn?unit=${unit.id}`}
                          className="block w-full p-3 text-center bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--primary-fg)] text-xs font-bold rounded-xl shadow-md transition-all no-underline flex flex-col items-center gap-1"
                          onClick={() => handleNodeClick(unit.id)}
                        >
                          <span className="text-[20px]">{state === 'passed' ? '⭐' : '🚀'}</span>
                          <span>{state === 'passed' ? '已通過' : '開始學習'}</span>
                        </Link>
                      ) : (
                        <div className="text-center p-3 text-xs text-[var(--muted)] font-medium flex flex-col items-center">
                          <span className="text-[24px]">🔒</span>
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

        <div className="mt-12 grid grid-cols-3 gap-4">
          {(['basic', 'advanced', 'exam'] as const).map((mode) => {
            const labels = { basic: '基礎練習', advanced: '進階題', exam: '歷年真題' } as Record<string, string>;
            const icons = { basic: '📖', advanced: '📚', exam: '📝' } as Record<string, string>;
            return (
              <Link
                key={mode}
                href={`/practice?mode=${mode}&unit=${units[0].id}`}
                className="btn btn-secondary p-4 rounded-xl h-auto flex flex-col items-center gap-2 text-sm shadow-lg hover:shadow-xl transition-all flex-1"
              >
                <span className="text-2xl">{icons[mode]}</span>
                {labels[mode]}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm opacity-75 bg-[var(--bg2)] p-4 rounded-xl">
          提示：單元基礎題正確率 ≥80% 且答 ≥4 題，即可解鎖下一關！
        </div>
      </div>
      <BottomNav active="map" />
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
