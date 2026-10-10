'use client';

import Link from 'next/link';
import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { QuestionCard } from '@/components/QuestionCard';
import { TopBar } from '@/components/TopBar';
import { ProgressRing } from '@/components/ProgressRing';
import { questions } from '@/lib/questions';
import { isDue } from '@/lib/srs';
import type { Question } from '@/lib/types';

function ReviewContent() {
  const { userData, recordAnswer, toggleMark, refreshSrs } = useUserData();
  const [reviewQs, setReviewQs] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentAns, setCurrentAns] = useState<string | string[] | undefined>(undefined);
  const [numCorrect, setNumCorrect] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const initializedRef = useRef(false);
  const today = new Date().toISOString().split('T')[0];

  // 只在第一次 userData 載入後計算一次複習清單，之後固定不變
  useEffect(() => {
    if (userData && !initializedRef.current) {
      const qs = questions.filter(q => {
        const marks = userData.questionMarks[q.id] || { unsure: false, wrong: false };
        const srs = userData.srs[q.id];
        return marks.unsure || marks.wrong || (srs && isDue(srs, today));
      });
      setReviewQs(qs);
      setCurrentIdx(0);
      setCurrentAns(undefined);
      setNumCorrect(0);
      setShowResults(false);
      initializedRef.current = true;
    }
  }, [userData, today]);

  const computeIsCorrect = useCallback((q: Question, ans: string | string[]): boolean => {
    const normalizeUser = (ua: string | string[]): string[] => {
      if (Array.isArray(ua)) return ua.slice().sort();
      return [ua.toString().trim().replace(/[−－]/g, '-')];
    };
    const normUser = normalizeUser(ans);
    const normCorrect = normalizeUser(q.answer);
    return (
      normUser.length === normCorrect.length &&
      normUser.every((v, i) => v === normCorrect[i])
    );
  }, []);

  const handleAnswer = (ans: string | string[]) => {
    if (!userData || reviewQs.length === 0) return;
    const q = reviewQs[currentIdx];

    if (Array.isArray(ans) && ans.length === 0) {
      // 下一題
      setCurrentAns(undefined);
      if (currentIdx < reviewQs.length - 1) {
        setCurrentIdx(idx => idx + 1);
      } else {
        setShowResults(true);
      }
      return;
    }

    // 記錄答案
    setCurrentAns(ans);
    const isCorrect = computeIsCorrect(q, ans);
    recordAnswer(q, ans, isCorrect);
    if (isCorrect) {
      setNumCorrect(c => c + 1);
    }
    refreshSrs(today);
    // 不移動 idx，持續顯示結果直到按下一題
  };

  const onToggleMark = (mark: 'unsure' | 'wrong') => {
    if (!userData || reviewQs.length === 0) return;
    const q = reviewQs[currentIdx];
    toggleMark(q.id, mark);
  };

  if (!userData) {
    return <div className="flex-1 flex items-center justify-center p-4"><div>載入中...</div></div>;
  }

  if (reviewQs.length === 0) {
    return (
      <>
        <TopBar title="複習區" />
        <div className="p-6 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold mb-4">沒有需要複習的題目！</h2>
          <p className="text-[var(--muted)] mb-8">你的基礎很穩固，继续保持哦！</p>
          <button className="btn btn-primary w-full max-w-md" onClick={() => window.location.reload()}>
            重新載入
          </button>
        </div>
      </>
    );
  }

  if (showResults) {
    const rate = Math.round((numCorrect / reviewQs.length) * 100);
    return (
      <>
        <TopBar title={`複習完成！正確率 ${rate}%`} />
        <div className="p-6 space-y-6 text-center flex-1 flex flex-col items-center justify-center">
          <ProgressRing progress={rate} size={120} />
          <h2 className="text-3xl font-bold">複習完成！</h2>
          <p className="text-[var(--muted)] mb-8">繼續保持，基礎更穩固！</p>
          <div className="flex gap-4 pt-6 w-full max-w-md">
            <button className="btn btn-primary flex-1" onClick={() => {
              setShowResults(false);
              setCurrentIdx(0);
              setCurrentAns(undefined);
              setNumCorrect(0);
            }}>
              再複習一次
            </button>
            <Link href="/" className="btn btn-secondary flex-1">
              回首頁
            </Link>
          </div>
        </div>
      </>
    );
  }

  const q = reviewQs[currentIdx];
  const marks = userData.questionMarks[q.id] || { unsure: false, wrong: false };
  const answered = currentAns !== undefined;
  const progress = reviewQs.length > 0 ? ((currentIdx + (answered ? 1 : 0)) / reviewQs.length) * 100 : 0;

  return (
    <>
      <TopBar
        title="錯題 + 不熟 + 複習"
        rightSlot={
          <div className="flex items-center gap-2">
            <ProgressRing progress={progress} size={48} />
            <span className="text-sm">{currentIdx + 1}/{reviewQs.length}</span>
          </div>
        }
      />
      <div className="flex flex-col flex-1 p-4 pb-[calc(88px+env(safe-area-inset-bottom))]">
        <QuestionCard
          question={q}
          onAnswer={handleAnswer}
          userAnswer={currentAns}
          showExplanation={true}
          marks={marks}
          onToggleMark={onToggleMark}
        />
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div>載入中...</div></div>}>
      <ReviewContent />
    </Suspense>
  );
}
