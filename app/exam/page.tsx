'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { TopBar } from '@/components/TopBar';
import { QuestionCard } from '@/components/QuestionCard';
import { BottomNav } from '@/components/BottomNav';
import { getQuestionsByTier } from '@/lib/questions';
import type { Question } from '@/lib/types';

/**
 * 模擬考：混合10題，計時10分，結束顯示結果
 */
export default function ExamPage() {
  const { userData, recordAnswer } = useUserData();
  const router = useRouter();
  const [today] = useState(() => new Date().toISOString().split('T')[0]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10分鐘
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!userData) return;

    // 抽10題：各 tier 混合，從解鎖 units
    const allBasic = getQuestionsByTier('basic');
    const allAdvanced = getQuestionsByTier('advanced');
    const allExam = getQuestionsByTier('exam');
    const examQuestions = [
      ...allBasic.slice(0,4),
      ...allAdvanced.slice(0,3),
      ...allExam.slice(0,3)
    ].sort(() => Math.random() - 0.5).slice(0,10);
    setQuestions(examQuestions);
  }, [userData]);

  useEffect(() => {
    if (timeLeft === 0 || finished) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finished]);

  const handleAnswer = useCallback((qId: string, ans: string | string[]) => {
    setUserAnswers(prev => ({ ...prev, [qId]: ans }));
  }, []);

  const submitExam = () => {
    let totalScore = 0;
    questions.forEach(q => {
      const userAns = userAnswers[q.id];
      let isCorrect = false;
      if (userAns) {
        if (Array.isArray(q.answer)) {
          if (Array.isArray(userAns)) {
            isCorrect = JSON.stringify([...userAns].sort()) === JSON.stringify([...q.answer].sort());
          }
        } else {
          isCorrect = (userAns as string).trim() === (q.answer as string).trim();
        }
      }
      recordAnswer(q, userAns || (Array.isArray(q.answer) ? [] : ''), isCorrect);
      if (isCorrect) totalScore++;
    });
    setScore(totalScore);
    setFinished(true);
  };

  const restart = () => {
    router.push('/exam');
  };

  if (!userData || questions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--text)]">載入考題中...</div>;
  }

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      <TopBar 
        title="模擬考試" 
        rightSlot={
          <div className="text-lg font-mono min-w-[5rem] text-right">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        } 
      />
      <div className="p-4 pb-20 min-h-screen bg-[var(--bg)] text-[var(--text)]">
        {!finished ? (
          <>
            <div className="mb-4 text-center">
              <div className="text-2xl font-bold">{currentIndex + 1} / {questions.length}</div>
            </div>
            <QuestionCard
              question={currentQ}
              onAnswer={(ans) => handleAnswer(currentQ.id, ans)}
              userAnswer={userAnswers[currentQ.id] as string | string[] | undefined}
              showExplanation={false}
            />
            <div className="fixed bottom-24 left-4 right-4 space-y-2">
              <button
                className="w-full bg-[var(--primary)] text-white py-4 px-6 rounded-xl text-lg font-bold shadow-lg hover:scale-105 active:scale-95"
                onClick={submitExam}
              >
                交卷
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="bg-[var(--bg-card)] py-3 px-6 rounded-xl text-lg border hover:bg-[var(--primary-light)]"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  上一題
                </button>
                <button
                  className="bg-[var(--bg-card)] py-3 px-6 rounded-xl text-lg border hover:bg-[var(--primary-light)]"
                  onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                  disabled={currentIndex === questions.length - 1}
                >
                  下一題
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <div className="text-6xl font-bold text-[var(--primary)] mb-4">{score} / {questions.length}</div>
            <div className="text-2xl mb-8">{Math.round((score / questions.length) * 100)} 分</div>
            <div className="max-w-2xl mx-auto space-y-4 mb-8">
              {questions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                let isCorrect = false;
                if (userAns) {
                  if (Array.isArray(q.answer)) {
                    if (Array.isArray(userAns)) {
                      isCorrect = JSON.stringify([...userAns].sort()) === JSON.stringify([...q.answer].sort());
                    }
                  } else {
                    isCorrect = (userAns as string).trim() === (q.answer as string).trim();
                  }
                }
                return (
                  <div key={q.id} className={`p-4 rounded-xl ${isCorrect ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-2`}>
                    <div className="font-bold mb-1">Q{idx+1}</div>
                    <div className="mb-2 opacity-75">{q.stem}</div>
                    <div><span className="font-bold">答：</span>{Array.isArray(userAns) ? userAns.join(',') : userAns}</div>
                    <div className="mt-2"><span className="font-bold">正解：</span>{Array.isArray(q.answer) ? q.answer.join(',') : q.answer}</div>
                    {q.explanation && <div className="mt-2 text-sm">{q.explanation}</div>}
                  </div>
                );
              })}
            </div>
            <button
              className="w-48 bg-[var(--primary)] text-white py-3 px-8 rounded-xl text-lg font-bold shadow-lg hover:scale-105"
              onClick={restart}
            >
              再考一次
            </button>
          </div>
        )}
      </div>
      <BottomNav active="exam" />
    </>
  );
}
