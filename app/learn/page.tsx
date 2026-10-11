'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { QuestionCard } from '@/components/QuestionCard';
import { LessonFigure } from '@/components/figures/LessonFigure';
import { TopBar } from '@/components/TopBar';
import { books, findUnit, getQuestionsByTier, isUnitUnlocked } from '@/lib/questions';
import type { Question } from '@/lib/types';

function LearnContent() {
  const searchParams = useSearchParams();
  const unitId = searchParams?.get('unit') || '';
  const { userData, recordAnswer, toggleMark, unlockUnit, refreshSrs } = useUserData();
  const [currentKP, setCurrentKP] = useState(0);
  const [lessonStep, setLessonStep] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceQs, setPracticeQs] = useState<string[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState<string | string[] | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setCurrentKP(0);
    setLessonStep(0);
    setPracticeMode(false);
    setPracticeAnswer(undefined);
    setPlaying(false);
  }, [unitId]);

  useEffect(() => {
    if (!playing) return;
    const locatedNow = unitId ? findUnit(unitId) : null;
    const len = locatedNow?.unit.knowledgePoints[currentKP]?.lesson.length ?? 0;
    if (len === 0 || lessonStep >= len - 1) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setLessonStep((step) => step + 1), 8500);
    return () => window.clearTimeout(id);
  }, [playing, lessonStep, currentKP, unitId]);

  if (!userData) return <div className="flex-1 flex items-center justify-center p-4"><div>載入中...</div></div>;

  const located = unitId ? findUnit(unitId) : null;
  const unit = located?.unit;
  if (!unit || !located) {
    return (
      <>
        <TopBar title="選擇單元學習" />
        <div className="space-y-6 p-4">
          {books.map((book) => (
            <section key={book.id}>
              <h2 className="mb-3 text-xl font-bold">{book.title}</h2>
              <div className="space-y-3">
                {book.chapters.map((chapter) => (
                  <div key={chapter.id} className="card p-4">
                    <h3 className="mb-2 font-bold">{chapter.title}</h3>
                    <div className="space-y-2">
                      {chapter.units.map((item) => {
                        const open = isUnitUnlocked(item.id, userData);
                        if (!open) {
                          return (
                            <p key={item.id} className="text-sm text-[var(--muted)]">{item.title} · 尚未解鎖</p>
                          );
                        }
                        return (
                          <Link
                            key={item.id}
                            href={`/learn?unit=${item.id}`}
                            className="block font-bold no-underline"
                            onClick={() => unlockUnit(item.id)}
                          >
                            {item.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
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
          <div className="card grow">
            <LessonFigure
              knowledgePointId={kp.id}
              step={lessonStep}
              lessonText={lesson[lessonStep]}
            />
            <div className="px-4 pb-3">
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => {
                  if (playing) {
                    setPlaying(false);
                    return;
                  }
                  if (lessonStep >= lesson.length - 1) setLessonStep(0);
                  setPlaying(true);
                }}
              >
                {playing ? '暫停自動播' : '慢慢自動播（每步約 8 秒）'}
              </button>
            </div>
            <div className="flex gap-2 p-4 pt-0">
              {lessonStep > 0 && (
                <button className="btn btn-secondary flex-1" onClick={() => { setPlaying(false); setLessonStep((s) => s - 1); }}>
                  上一步
                </button>
              )}
              {lessonStep < lesson.length - 1 ? (
                <button className="btn btn-primary flex-1" onClick={() => { setPlaying(false); setLessonStep((s) => s + 1); }}>
                  看懂了，下一步
                </button>
              ) : currentKP < unit.knowledgePoints.length - 1 ? (
                <button className="btn btn-primary flex-1" onClick={() => {
                  setPlaying(false);
                  setCurrentKP((k) => k + 1);
                  setLessonStep(0);
                }}>
                  下一個觀念
                </button>
              ) : (
                <>
                  <button className="btn btn-secondary flex-1" onClick={() => {
                    setPlaying(false);
                    setCurrentKP(0);
                    setLessonStep(0);
                  }}>
                    重新開始
                  </button>
                  <button className="btn btn-primary flex-1" onClick={() => {
                    const qs = getQuestionsByTier('basic', unitId).slice(0, 5).map(q => q.id);
                    setPracticeQs(qs);
                    setCurrentQIdx(0);
                    setPracticeAnswer(undefined);
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

  const currentQId = practiceQs[currentQIdx];
  const questions = getQuestionsByTier('basic', unitId);
  const q = questions.find(qq => qq.id === currentQId)! as Question;

  const checkAnswer = (question: Question, userAnswer: string | string[]): boolean => {
    const norm = (value: string) => value.trim().replace(/[−－]/g, '-').toUpperCase();
    const normAns = Array.isArray(question.answer)
      ? question.answer.map((a: string) => norm(a)).sort().join('')
      : norm(question.answer);
    const normUser = Array.isArray(userAnswer)
      ? userAnswer.map((a: string) => norm(a)).sort().join('')
      : norm(userAnswer.toString());
    return normAns === normUser;
  };

  const handleAnswer = (ans: string | string[]) => {
    if (Array.isArray(ans) && ans.length === 0) {
      if (currentQIdx < practiceQs.length - 1) {
        setCurrentQIdx(idx => idx + 1);
        setPracticeAnswer(undefined);
      } else {
        setPracticeAnswer(undefined);
        setPracticeMode(false);
        setLessonStep(0);
      }
      return;
    }
    if (practiceAnswer !== undefined) return;
    const isCorrect = checkAnswer(q, ans);
    recordAnswer(q, ans, isCorrect);
    refreshSrs(today);
    setPracticeAnswer(ans);
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
          userAnswer={practiceAnswer}
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
