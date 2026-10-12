'use client';

import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { useUserData } from '@/lib/useUserData';
import {
  books,
  findChapter,
  getUnitProgress,
  isUnitUnlocked,
  questions,
  unitPassed,
} from '@/lib/questions';
import type { Unit } from '@/lib/types';
import { SUBJECT_TABS } from '@/lib/subjects';

type UnitState = 'passed' | 'unlocked' | 'locked';

function nodeStyle(state: UnitState): CSSProperties {
  if (state === 'passed') {
    return {
      backgroundColor: 'var(--accent)',
      color: 'var(--primary-fg)',
      boxShadow: 'inset 0 0 0 3px var(--accent)',
    };
  }
  if (state === 'unlocked') {
    return {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-fg)',
      boxShadow: 'inset 0 0 0 3px var(--primary-dark)',
    };
  }
  return {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--fg)',
    boxShadow: 'inset 0 0 0 3px var(--muted)',
    backgroundImage:
      'repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--muted) 45%, transparent) 6px 7px)',
  };
}

function MapContent() {
  const { userData } = useUserData();
  const searchParams = useSearchParams();
  const bookId = searchParams?.get('book') || '';
  const chapterId = searchParams?.get('chapter') || '';

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--fg)]">載入中...</div>;
  }

  const book = books.find((item) => item.id === bookId) ?? null;
  const located = chapterId ? findChapter(chapterId) : null;

  const shell = (title: string, body: ReactNode) => (
    <>
      <TopBar title={title} />
      <div className="min-h-screen bg-[var(--bg)] p-4 pb-[calc(96px+env(safe-area-inset-bottom))] text-[var(--fg)]">
        {body}
      </div>
      <BottomNav />
    </>
  );

  if (!book) {
    return shell(
      '學習地圖',
      <>
        <h1 className="mb-2 text-center text-2xl font-bold">國一到國三課程</h1>
        <p className="mb-6 text-center text-sm text-[var(--muted)]">選一個學期，再進入章節。</p>
        <div className="mx-auto max-w-lg space-y-6">
          {SUBJECT_TABS.map((tab) => {
            const items = books.filter((item) => item.subject === tab.id);
            if (items.length === 0) return null;
            return (
              <section key={tab.id}>
                <h2 className="mb-2 text-lg font-bold">{tab.label}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((item) => {
                    const unitCount = item.chapters.reduce((sum, chapter) => sum + chapter.units.length, 0);
                    return (
                      <Link
                        key={item.id}
                        href={`/map?book=${item.id}`}
                        className="card p-4 no-underline"
                      >
                        <div className="text-lg font-bold">{item.title}</div>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.chapters.length} 章 · {unitCount} 單元</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </>,
    );
  }

  if (!located || located.book.id !== book.id) {
    return shell(
      book.title,
      <>
        <div className="mb-4">
          <Link href="/map" className="text-sm font-bold text-[var(--primary)]">← 全部學期</Link>
        </div>
        <h1 className="mb-6 text-center text-2xl font-bold">{book.title}</h1>
        <div className="mx-auto max-w-lg space-y-3">
          {book.chapters.map((chapter, index) => (
            <Link
              key={chapter.id}
              href={`/map?book=${book.id}&chapter=${chapter.id}`}
              className="card flex items-center gap-4 p-4 no-underline"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/20 text-lg font-bold">
                {index + 1}
              </div>
              <div>
                <h2 className="font-bold">{chapter.title}</h2>
                <p className="text-sm text-[var(--muted)]">{chapter.units.length} 個單元</p>
              </div>
            </Link>
          ))}
        </div>
      </>,
    );
  }

  const chapter = located.chapter;
  const units: Unit[] = chapter.units;
  const getUnitState = (unitId: string): UnitState => {
    if (unitPassed(unitId, userData)) return 'passed';
    if (isUnitUnlocked(unitId, userData)) return 'unlocked';
    return 'locked';
  };

  return shell(
    '學習地圖',
    <>
      <div className="mb-4">
        <Link href={`/map?book=${book.id}`} className="text-sm font-bold text-[var(--primary)]">← {book.title}</Link>
      </div>
      <h1 className="mb-6 text-center text-2xl font-bold">{chapter.title}</h1>
      <ol className="relative mx-auto mb-8 max-w-lg">
        {units.map((unit, idx) => {
          const state = getUnitState(unit.id);
          const progress = getUnitProgress(unit.id, userData);
          const total = questions.filter((q) => q.unitId === unit.id).length;
          const isActionable = state !== 'locked';
          return (
            <li key={unit.id} className="relative flex items-start gap-4 pb-8 last:pb-0">
              {idx < units.length - 1 && (
                <span
                  className="pointer-events-none absolute bottom-0 left-8 top-16 w-[3px] -translate-x-1/2"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, var(--primary) 0 8px, transparent 8px 14px)',
                  }}
                  aria-hidden
                />
              )}
              <div
                className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold"
                style={nodeStyle(state)}
                aria-label={state === 'locked' ? `第 ${idx + 1} 關，尚未解鎖` : `第 ${idx + 1} 關`}
              >
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <h2 className="break-words text-base font-semibold leading-snug">{unit.title}</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">{total} 題 · 已作答正確率 {Math.round(progress.correctRate * 100)}%</p>
                {isActionable ? (
                  <Link
                    href={`/learn?unit=${unit.id}`}
                    className="mt-3 inline-flex w-full items-center justify-center px-4 py-3 text-sm font-bold no-underline sm:w-auto"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-fg)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    {state === 'passed' ? '已通過' : '開始學習'}
                  </Link>
                ) : (
                  <p className="mt-2 text-sm font-medium text-[var(--muted)]">尚未解鎖</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(['basic', 'advanced', 'exam'] as const).map((mode) => {
          const labels = { basic: '基礎練習', advanced: '進階題', exam: '會考練習' };
          return (
            <Link
              key={mode}
              href={`/practice?mode=${mode}&unit=${units[0].id}`}
              className="btn btn-secondary flex h-auto flex-1 flex-col items-center gap-2 rounded-xl p-6 text-sm shadow-lg"
            >
              {labels[mode]}
            </Link>
          );
        })}
      </div>
      <div className="rounded-xl border border-[var(--border)]/50 bg-[var(--bg2)] p-4 text-center text-sm opacity-75">
        所有單元都已開放，不用先通過前一關。答對率達 80% 且至少作答 4 題會標成已通過。會考練習是依課綱自編的題目，不是歷屆原題。
      </div>
    </>,
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">載入中...</div>}>
      <MapContent />
    </Suspense>
  );
}
