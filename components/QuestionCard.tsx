'use client';

import { Question, QuestionType, QuestionMark } from '@/lib/types';
import { LessonFigure } from '@/components/figures/LessonFigure';
import { primeVoices, speakEnglish } from '@/lib/browserSpeech';
import { englishFromQuestion } from '@/lib/englishSpeech';
import { useEffect, useState, useRef } from 'react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (ans: string | string[]) => void;
  userAnswer?: string | string[];
  showExplanation?: boolean;
  marks?: QuestionMark;
  onToggleMark?: (mark: 'unsure' | 'wrong') => void;
  /** 填滿父層：題幹與解析在內部捲動，操作列留在底部導覽上方 */
  fill?: boolean;
}

export function QuestionCard({
  question,
  onAnswer,
  userAnswer,
  showExplanation = false,
  marks = { unsure: false, wrong: false },
  onToggleMark,
  fill = false,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const heard =
    question.subject === 'english' ? englishFromQuestion(question.stem, question.options) : '';

  useEffect(() => {
    if (heard) primeVoices();
  }, [heard]);

  const handleSubmit = () => {
    if (question.type === 'fill') {
      const ans = inputRef.current?.value.trim().replace(/[−－]/g, '-') || '';
      onAnswer(ans);
    } else {
      onAnswer(selected);
    }
  };

  const formatAnswer = (ans: string | string[]): string => {
    if (Array.isArray(ans)) {
      return ans.join('、');
    }
    return ans.toString().trim().replace(/[−－]/g, '-');
  };

  const isCorrect = (() => {
    if (userAnswer === undefined) return false;
    const norm = (value: string) => value.toString().trim().replace(/[−－]/g, '-');
    const normUser = Array.isArray(userAnswer)
      ? (userAnswer as string[]).map(norm).sort()
      : [norm(userAnswer.toString())];
    const normCorrect = Array.isArray(question.answer)
      ? (question.answer as string[]).map(norm).sort()
      : [norm(question.answer as string)];
    return normUser.length === normCorrect.length && normUser.every((v, i) => v === normCorrect[i]);
  })();

  const correctAns = Array.isArray(question.answer) ? question.answer : [question.answer as string];

  return (
    <div className={`card mx-4 flex flex-col ${fill ? 'min-h-0 flex-1 overflow-hidden' : ''}`}>
      <div className={fill ? 'min-h-0 flex-1 overflow-y-auto' : ''}>
        <h3 className="section-title mb-4">題目 {question.tags.join(' ')}</h3>
        <p className="text-[var(--fg)] mb-6 whitespace-pre-wrap leading-relaxed">{question.stem}</p>
        {heard && (
          <div className="mb-4">
            <button type="button" className="btn btn-secondary px-3 py-2 text-sm" onClick={() => speakEnglish(heard)}>
              聽英文
            </button>
          </div>
        )}
        
        {question.type !== 'fill' && question.options && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {question.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSel = selected.includes(letter);
              const isRight = correctAns.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => {
                    if (!userAnswer) {
                      setSelected(prev =>
                        isSel
                          ? prev.filter(s => s !== letter)
                          : question.type === 'single'
                          ? [letter]
                          : [...prev, letter]
                      );
                    }
                  }}
                  disabled={!!userAnswer}
                  className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                    userAnswer
                      ? isRight
                        ? 'bg-green-500/20 border-green-500 text-green-700 font-bold'
                        : isSel
                        ? 'bg-red-500/20 border-red-500 text-red-700 font-bold'
                        : 'bg-[var(--bg2)] border-[var(--border)]'
                      : isSel
                      ? 'bg-[var(--primary)]/20 border-[var(--primary)] ring-2 ring-[var(--primary)]/50'
                      : 'bg-[var(--bg2)] border-[var(--border)] hover:bg-[var(--card)]'
                  }`}
                >
                  <span className="font-bold mr-2">{letter}.</span>{opt}
                </button>
              );
            })}
          </div>
        )}
        
        {question.type === 'fill' && (
          <div className="mb-6">
            <input
              ref={inputRef}
              type="text"
              className="w-full p-4 border-2 border-[var(--border)] rounded-xl text-lg font-mono text-center focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 bg-[var(--bg2)]"
              placeholder="請填入答案"
              defaultValue={typeof userAnswer === 'string' ? userAnswer : ''}
              disabled={!!userAnswer}
            />
          </div>
        )}

        {userAnswer !== undefined && (
        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <div className={`p-4 rounded-xl text-center font-bold text-xl ${
            isCorrect
              ? 'bg-green-500/20 border-2 border-green-500 text-green-800'
              : 'bg-red-500/20 border-2 border-red-500 text-red-800'
          }`}>
            {isCorrect ? '✅ 正確！' : `❌ 錯誤，你的答案：${formatAnswer(userAnswer)}`}
            {` 正確答案：${formatAnswer(question.answer)}`}
          </div>
          {showExplanation && (
            <div className="p-4 bg-[var(--bg2)]/50 rounded-xl border border-dashed border-[var(--border)]">
              <h4 className="font-bold mb-2">解析：</h4>
              <LessonFigure knowledgePointId={question.knowledgePointId} step={0} compact />
              <p className="whitespace-pre-wrap">{question.explanation}</p>
            </div>
          )}
          {onToggleMark && isCorrect && marks.wrong && (
            <button
              className="w-full p-4 rounded-xl bg-green-500/20 border-2 border-green-500 text-green-700 font-bold text-lg"
              onClick={() => onToggleMark('wrong')}
            >
              答對了！移除錯題標記
            </button>
          )}
        </div>
        )}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-[var(--border)] px-0 pt-4">
        {userAnswer !== undefined ? (
          <>
            <button className="btn flex-1 btn-primary" onClick={() => onAnswer([])}>
              下一題
            </button>
            {onToggleMark && (
              <div className="flex gap-1 flex-1">
                <button
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition ${
                    marks.unsure
                      ? 'bg-yellow-500 text-white'
                      : 'bg-yellow-200 text-yellow-800 border border-yellow-300'
                  }`}
                  onClick={() => onToggleMark('unsure')}
                >
                  🤔 不熟
                </button>
                <button
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition ${
                    marks.wrong
                      ? 'bg-red-500 text-white'
                      : 'bg-red-200 text-red-800 border border-red-300'
                  }`}
                  onClick={() => onToggleMark('wrong')}
                >
                  ❌ 錯題
                </button>
              </div>
            )}
          </>
        ) : (
          <button className="btn btn-primary flex-1" onClick={handleSubmit}>
            {question.type === 'fill' ? '送出答案' : '確認選項'}
          </button>
        )}
      </div>
    </div>
  );
}
