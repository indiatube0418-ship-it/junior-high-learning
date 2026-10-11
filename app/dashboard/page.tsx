'use client';

import { useState } from 'react';
import { useUserData } from '@/lib/useUserData';
import { TopBar } from '@/components/TopBar';
import { ProgressRing } from '@/components/ProgressRing';
import { BottomNav } from '@/components/BottomNav';
import { books, getUnitProgress, questions } from '@/lib/questions';
import type { UserData } from '@/lib/types';

/**
 * 進度儀表板：總覽、單元長條、弱點、待複習
 */
export default function DashboardPage() {
  const { userData } = useUserData();
  const [today] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookId, setBookId] = useState(books[0].id);

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--fg)]">載入中...</div>;
  }

  const answerRecords = userData.answerRecords;
  const totalQuestions = answerRecords.length;
  const correctCount = answerRecords.filter(r => r.isCorrect).length;
  const overallRate = totalQuestions > 0 ? correctCount / totalQuestions : 0;

  // 單元進度
  const book = books.find((item) => item.id === bookId) ?? books[0];
  const unitProgresses = book.chapters.flatMap((chapter) => chapter.units.map(unit => ({
    unitId: unit.id,
    title: unit.title,
    ...getUnitProgress(unit.id, userData)
  })));

  // 弱點知識點：各 KP 正確率最低前 3，水平條
  const latestRecords: Record<string, boolean> = {};
  for (const record of userData.answerRecords.slice().reverse()) {
    if (!(record.questionId in latestRecords)) {
      latestRecords[record.questionId] = record.isCorrect;
    }
  }

  const kpCorrectSums: Record<string, { sum: number; count: number }> = {};
  const allKps: Record<string, string> = {};
  for (const item of books) {
    for (const chapter of item.chapters) {
      for (const unit of chapter.units) {
        for (const kp of unit.knowledgePoints) {
          allKps[kp.id] = kp.title;
        }
      }
    }
  }
  for (const qId in latestRecords) {
    const q = questions.find(q => q.id === qId);
    if (!q) continue;
    const kpId = q.knowledgePointId;
    if (!kpCorrectSums[kpId]) {
      kpCorrectSums[kpId] = { sum: 0, count: 0 };
    }
    kpCorrectSums[kpId].sum += latestRecords[qId] ? 1 : 0;
    kpCorrectSums[kpId].count += 1;
  }

  const weakProgress = Object.entries(kpCorrectSums)
    .map(([id, data]) => ({
      id,
      title: allKps[id]?.slice(0, 12) || id,
      rate: data.count > 0 ? data.sum / data.count : 0
    }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  // 待複習：SRS due today
  const dueCount = Object.values(userData.srs).filter(s => s.dueDate === today).length;

  return (
    <>
      <TopBar title="進度儀表板" />
      <div className="p-4 pb-20 bg-[var(--bg)] text-[var(--fg)]">
        {/* 總覽卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl text-center shadow-lg">
            <div className="text-3xl font-bold text-[var(--primary)]">{totalQuestions}</div>
            <div className="text-sm opacity-75 mt-1">總答題數</div>
          </div>
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl text-center shadow-lg relative">
            <div className="w-24 h-24 mx-auto">
              <ProgressRing progress={overallRate * 100} size={72} />
            </div>
            <div className="text-sm opacity-75 mt-2">總正確率</div>
          </div>
        </div>

        {/* 單元長條圖 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">單元進度</h2>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {books.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === book.id ? 'btn btn-primary px-3 py-1 text-sm' : 'btn btn-secondary px-3 py-1 text-sm'}
                onClick={() => setBookId(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {unitProgresses.map(({ unitId, title, correctRate }) => (
              <div key={unitId} className="flex items-center justify-between">
                <div className="min-w-[120px] text-sm font-medium truncate pr-2">{title}</div>
                <div className="flex-1 mx-4 bg-[var(--border)] rounded-full h-4">
                  <div
                    className="bg-[var(--primary)] h-4 rounded-full transition-all duration-500"
                    style={{ width: `${correctRate * 100}%` }}
                  />
                </div>
                <div className="w-16 text-sm font-bold text-right">{Math.round(correctRate * 100)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* 弱點與待複習 */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-4">弱點知識點</h3>
            {weakProgress.length > 0 ? (
              <div className="space-y-2">
                {weakProgress.map(wp => (
                  <div key={wp.id} className="flex items-center gap-3 py-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate text-[var(--fg)]">{wp.title}</div>
                    </div>
                    <div className="w-16 text-xs font-bold text-right opacity-75">{Math.round(wp.rate * 100)}%</div>
                    <div className="w-20 h-2 bg-[var(--border)] rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="bg-red-400 h-2 rounded-full transition-all"
                        style={{ width: `${wp.rate * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm opacity-75 text-center py-4">暫無弱點知識點<br />繼續加油，保持優勢！</div>
            )}
          </div>
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-lg text-center">
            <div className="text-3xl font-bold text-[var(--primary)] mb-2">{dueCount}</div>
            <div className="text-sm opacity-75">今日待複習</div>
          </div>
        </div>
      </div>
      <BottomNav active="dashboard" />
    </>
  );
}
