'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { QuestionCard } from '@/components/QuestionCard';
import { TopBar } from '@/components/TopBar';
import { getQuestionsByTier } from '@/lib/questions';
import data from '@/data/math-grade1-sem1-chapter1.json';
import type { Chapter, Question } from '@/lib/types';

function LearnContent() {
  const searchParams = useSearchParams();
  const unitId = searchParams?.get('unit') || '';
  const { userData, recordAnswer, toggleMark, unlockUnit, refreshSrs } = useUserData();
  const [currentKP, setCurrentKP] = useState(0);
  const [lessonStep, setLessonStep] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceQs, setPracticeQs] = useState<string[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  if (!userData) return <div className="flex-1 flex items-center justify-center p-4"><div>載入中...</div></div>;

  const chapterData = data as { chapter: Chapter };
  const chapter = chapterData.chapter;
  const unit = chapter.units.find(u => u.id === unitId);
  if (!unit) {
    // 顯示單元選擇
    return (
      <>
        <TopBar title="選擇單元學習" />
        <div className="p-4 space-y-4">
          <h2 className="text-2xl font-bold text-center">國一上 第1章 整數的運算</h2>
          {chapter.units.map((u) => (
            <Link
              key={u.id}
              href={`/learn?unit=${u.id}`}
              className="block card p-6 text-center"
              onClick={() => unlockUnit(u.id)}
            >
              <h3 className="text-xl font-bold">{u.title}</h3>
            </Link>
          ))}
        </div>
      </>
    );
  }

  const kp = unit.knowledgePoints[currentKP];
  const lesson = kp.lesson;

  if (!practiceMode) {
    return (
      <>
        <TopBar title={`${unit.title} - ${kp.title}`} />
        <div className="p-4 space-y-6 flex-1 flex flex-col">
          {/* 教學內容 */}
          <div className="card grow">
            <div className="prose max-w-none">
              {lesson.slice(0, lessonStep + 1).map((para, i) => (
                <p key={i} className="mb-4 p-4 bg-[var(--bg2)] rounded-xl">{para}</p>
              ))}
            </div>
            <div className="flex gap-2 p-4 pt-0">
              {lessonStep < lesson.length - 1 ? (
                <button className="btn btn-primary flex-1" onClick={() => setLessonStep(s => s + 1)}>
                  下一段 →
                </button>
              ) : (
                <>
                  <button className="btn btn-secondary flex-1" onClick={() => setCurrentKP(0)}>
                    重新開始
                  </button>
                  <button className="btn btn-primary flex-1" onClick={() => {
                    const qs = getQuestionsByTier('basic', unitId).slice(0, 5).map(q => q.id);
                    setPracticeQs(qs);
                    setCurrentQIdx(0);
                    setPracticeMode(true);
                  }}>
                    開始練習 (5題)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // 練習模式
  const currentQId = practiceQs[currentQIdx];
  const questions = getQuestionsByTier('basic', unitId);
  const q = questions.find(qq => qq.id === currentQId)! as Question;

  const checkAnswer = (question: Question, userAnswer: string | string[]): boolean => {
    const normAns = Array.isArray(question.answer)
      ? question.answer.map((a: string) => a.trim().toUpperCase()).sort().join('')
      : question.answer.trim().toUpperCase();
    const normUser = Array.isArray(userAnswer)
      ? userAnswer.map((a: string) => a.trim().toUpperCase()).sort().join('')
      : userAnswer.toString().trim().toUpperCase();
    return normAns === normUser;
  };

  const handleAnswer = (ans: string | string[]) => {
    const isCorrect = checkAnswer(q, ans);
    recordAnswer(q, ans, isCorrect);
    refreshSrs(today);
    if (currentQIdx < practiceQs.length - 1) {
      setCurrentQIdx(idx => idx + 1);
    } else {
      setPracticeMode(false);
    }
  };

  return (
    <>
      <TopBar 
        title={`練習 ${currentQIdx + 1}/${practiceQs.length}`}
        rightSlot={<button className="btn btn-secondary text-sm px-3 py-1" onClick={() => setPracticeMode(false)}>結束</button>}
      />
      <div className="p-4 h-screen flex flex-col">
        <QuestionCard
          question={q}
          onAnswer={handleAnswer}
          showExplanation={true}
          marks={userData.questionMarks[q.id] || { unsure: false, wrong: false }}
          onToggleMark={(mark) => toggleMark(q.id, mark)}
        />
        {currentQIdx > 0 && (
          <button className="btn btn-secondary mx-4 mb-4" onClick={() => setCurrentQIdx(currentQIdx - 1)}>
            上一題
          </button>
        )}
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-4"><div>載入中...</div></div>}>
      <LearnContent />
    </Suspense>
  );
}
