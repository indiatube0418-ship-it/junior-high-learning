'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { TopBar } from '@/components/TopBar';
import { QuestionCard } from '@/components/QuestionCard';
import { LessonFigure } from '@/components/figures/LessonFigure';
import { getQuestionsByTier, sampleQuestions } from '@/lib/questions';
import type { Question, Subject } from '@/lib/types';
import { subjectFromQuery } from '@/lib/subjects';

function drawExamQuestions(subject: Subject): Question[] {
  const examQuestions = sampleQuestions(getQuestionsByTier('exam', undefined, subject), 10);
  if (examQuestions.length >= 10) return examQuestions;
  const extra = sampleQuestions(getQuestionsByTier('advanced', undefined, subject), 10 - examQuestions.length);
  return [...examQuestions, ...extra];
}

function normalizeAnswer(value: string | string[]): string[] {
  const list = Array.isArray(value) ? value : [value];
  return list.map((item) => item.toString().trim().replace(/[−－]/g, '-')).sort();
}

function answersMatch(expected: string | string[], given: string | string[] | undefined): boolean {
  if (given === undefined) return false;
  const user = normalizeAnswer(given);
  const correct = normalizeAnswer(expected);
  return user.length === correct.length && user.every((item, index) => item === correct[index]);
}

/**
 * 模擬考：混合 10 題，計時 10 分，結束顯示結果。
 * 題幹在內部捲動，交卷與換題留在底部導覽上方。
 */
function ExamContent() {
  const searchParams = useSearchParams();
  const subject = subjectFromQuery(searchParams?.get('subject') || 'math');
  const { userData, recordAnswer } = useUserData();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!userData) return;
    setQuestions(drawExamQuestions(subject));
  }, [userData, subject]);

  useEffect(() => {
    if (timeLeft === 0 || finished) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finished]);

  const submitExam = useCallback(() => {
    if (submittedRef.current || questions.length === 0) return;
    submittedRef.current = true;
    let totalScore = 0;
    questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      const isCorrect = answersMatch(q.answer, userAns);
      recordAnswer(q, userAns ?? (Array.isArray(q.answer) ? [] : ''), isCorrect);
      if (isCorrect) totalScore += 1;
    });
    setScore(totalScore);
    setFinished(true);
  }, [questions, userAnswers, recordAnswer]);

  const handleAnswer = useCallback((qId: string, ans: string | string[]) => {
    if (Array.isArray(ans) && ans.length === 0) {
      setCurrentIndex((index) => Math.min(questions.length - 1, index + 1));
      return;
    }
    setUserAnswers((prev) => ({ ...prev, [qId]: ans }));
  }, [questions.length]);

  const restart = () => {
    submittedRef.current = false;
    setUserAnswers({});
    setCurrentIndex(0);
    setFinished(false);
    setScore(0);
    setTimeLeft(600);
    setQuestions(drawExamQuestions(subject));
  };

  if (!userData || questions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--text)]">載入考題中...</div>;
  }

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex h-[calc(100dvh-var(--bottom-nav-offset))] max-h-[calc(100dvh-var(--bottom-nav-offset))] flex-col overflow-hidden">
      <TopBar
        title="模擬考試"
        rightSlot={
          <div className="text-lg font-mono min-w-[5rem] text-right">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        }
      />
      {!finished ? (
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="mb-3 shrink-0 text-center text-2xl font-bold">
            {currentIndex + 1} / {questions.length}
          </div>
          <QuestionCard
            fill
            question={currentQ}
            onAnswer={(ans) => handleAnswer(currentQ.id, ans)}
            userAnswer={userAnswers[currentQ.id]}
            showExplanation={false}
          />
          <div className="mt-3 shrink-0 space-y-2">
            <button type="button" className="btn btn-primary w-full py-4 text-lg font-bold" onClick={submitExam}>
              交卷
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn btn-secondary py-3 text-lg"
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                disabled={currentIndex === 0}
              >
                上一題
              </button>
              <button
                type="button"
                className="btn btn-secondary py-3 text-lg"
                onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}
                disabled={currentIndex === questions.length - 1}
              >
                下一題
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="shrink-0 text-center">
            <div className="mb-2 text-6xl font-bold text-[var(--primary)]">{score} / {questions.length}</div>
            <div className="mb-4 text-2xl">{Math.round((score / questions.length) * 100)} 分</div>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
            {questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = answersMatch(q.answer, userAns);
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border-2 p-4 ${
                    isCorrect
                      ? 'border-green-700 bg-green-100 text-green-950'
                      : 'border-red-700 bg-red-100 text-red-950'
                  }`}
                >
                  <div className="mb-1 font-bold">Q{idx + 1}</div>
                  <div className="mb-2 opacity-80">{q.stem}</div>
                  <div>
                    <span className="font-bold">答：</span>
                    {userAns === undefined ? '（未作答）' : Array.isArray(userAns) ? userAns.join(',') : userAns}
                  </div>
                  <div className="mt-2">
                    <span className="font-bold">正解：</span>
                    {Array.isArray(q.answer) ? q.answer.join(',') : q.answer}
                  </div>
                  {q.explanation && (
                    <div className="mt-2 text-sm">
                      <LessonFigure knowledgePointId={q.knowledgePointId} step={0} compact />
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex shrink-0 gap-2">
            <button type="button" className="btn btn-primary flex-1 py-3 text-lg font-bold" onClick={restart}>
              再考一次
            </button>
            <Link href="/" className="btn btn-secondary flex-1 py-3 text-lg font-bold">
              回首頁
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">載入考題中...</div>}>
      <ExamContent />
    </Suspense>
  );
}
