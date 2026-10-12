'use client';

import Link from 'next/link';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { QuestionCard } from '@/components/QuestionCard';
import { TopBar } from '@/components/TopBar';
import { ProgressRing } from '@/components/ProgressRing';
import { getQuestionsByTier, sampleQuestions } from '@/lib/questions';
import type { Question, Subject } from '@/lib/types';
import { subjectFromQuery } from '@/lib/subjects';

function PracticeContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams?.get('mode') || 'basic') as 'basic' | 'advanced' | 'exam';
  const unitId = searchParams?.get('unit') || '';
  const subject = subjectFromQuery(searchParams?.get('subject') || 'math');
  const { userData, recordAnswer, toggleMark, refreshSrs } = useUserData();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [numCorrect, setNumCorrect] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const modeNames: Record<'basic' | 'advanced' | 'exam', string> = {
    basic: '基礎練習',
    advanced: '進階練習',
    exam: '會考練習',
  };

  // 載入題目清單，只依賴 mode/unitId，一次計算固定
  useEffect(() => {
    const pool = getQuestionsByTier(mode, unitId || undefined, unitId ? undefined : subject);
    const qs = mode === 'exam' && !unitId ? sampleQuestions(pool, 10) : pool.slice(0, 20);
    setQuestions(qs);
    setCurrentIdx(0);
    setUserAnswers({});
    setNumCorrect(0);
    setShowResults(false);
  }, [mode, unitId, subject]);

  // userData 載入後刷新 SRS（不影響題目清單）
  useEffect(() => {
    if (userData) {
      refreshSrs(today);
    }
  }, [userData, refreshSrs, today]);

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
    const currentQId = questions[currentIdx]?.id;
    if (!currentQId) return;

    setUserAnswers(prev => ({ ...prev, [currentQId]: ans }));

    if (Array.isArray(ans) && ans.length === 0) {
      // 下一題
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(idx => idx + 1);
      } else {
        setShowResults(true);
      }
      return;
    }

    // 記錄答案
    const q = questions[currentIdx];
    const isCorrect = computeIsCorrect(q, ans);
    recordAnswer(q, ans, isCorrect);
    if (isCorrect) {
      setNumCorrect(c => c + 1);
    }
    // 不移動 idx，持續顯示結果直到按下一題
  };

  const onToggleMark = (mark: 'unsure' | 'wrong') => {
    const currentQId = questions[currentIdx]?.id;
    if (currentQId && userData) {
      toggleMark(currentQId, mark);
    }
  };

  if (!userData || questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div>載入題目中...</div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const currentMarks = userData.questionMarks[currentQ.id] || { unsure: false, wrong: false };
  const answered = !!userAnswers[currentQ.id];
  const progress = questions.length > 0 ? ((currentIdx + (answered ? 1 : 0)) / questions.length) * 100 : 0;

  if (showResults) {
    const rate = Math.round((numCorrect / questions.length) * 100);
    return (
      <>
        <TopBar title={`練習完成！正確率 ${rate}%`} />
        <div className="p-6 space-y-6 text-center flex-1 flex flex-col items-center justify-center">
          <ProgressRing progress={rate} size={120} />
          <h2 className="text-3xl font-bold">獲得獎勵！</h2>
          <div className="space-y-2 text-lg">
            <p>飼料 +10</p>
            <p>經驗 +50</p>
            <p>金幣 +20</p>
          </div>
          <div className="flex gap-4 pt-6 w-full max-w-md">
            <Link href={`/practice?mode=${mode}${unitId ? `&unit=${unitId}` : ''}`} className="btn btn-primary flex-1">
              再練一次
            </Link>
            <Link href="/" className="btn btn-secondary flex-1">
              回首頁
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-var(--bottom-nav-offset))] max-h-[calc(100dvh-var(--bottom-nav-offset))] flex-col overflow-hidden">
      <TopBar
        title={modeNames[mode]}
        rightSlot={
          <div className="flex items-center gap-2">
            <ProgressRing progress={progress} size={48} />
            <span className="text-sm">{currentIdx + 1}/{questions.length}</span>
          </div>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <QuestionCard
          fill
          question={currentQ}
          onAnswer={handleAnswer}
          userAnswer={userAnswers[currentQ.id] || undefined}
          showExplanation={true}
          marks={currentMarks}
          onToggleMark={onToggleMark}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div>載入中...</div></div>}>
      <PracticeContent />
    </Suspense>
  );
}
