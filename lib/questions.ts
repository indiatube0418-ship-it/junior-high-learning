/**
 * 題庫：國一到國三數學。
 * 進度以單元最新作答計算。所有單元都開放，不依前一關上鎖。
 * 答對率 ≥80% 且至少 4 題，單元標成已通過。
 */

import bank from '@/data/math-bank.json';
import type { Chapter, Grade, Question, Semester, Tier, Unit, UserData } from './types';

export interface CourseBook {
  id: string;
  title: string;
  grade: Grade;
  semester: Semester;
  chapters: Chapter[];
}

const data = bank as unknown as { books: CourseBook[]; questions: Question[] };

export const books: CourseBook[] = data.books;
export const questions: Question[] = data.questions;

export function allChapters(): Chapter[] {
  return books.flatMap((book) => book.chapters);
}

export function allUnits(): Unit[] {
  return allChapters().flatMap((chapter) => chapter.units);
}

export function findUnit(unitId: string): { book: CourseBook; chapter: Chapter; unit: Unit } | null {
  for (const book of books) {
    for (const chapter of book.chapters) {
      const unit = chapter.units.find((item) => item.id === unitId);
      if (unit) return { book, chapter, unit };
    }
  }
  return null;
}

export function findChapter(chapterId: string): { book: CourseBook; chapter: Chapter } | null {
  for (const book of books) {
    const chapter = book.chapters.find((item) => item.id === chapterId);
    if (chapter) return { book, chapter };
  }
  return null;
}

export function getQuestionsByTier(tier: Tier, unitId?: string): Question[] {
  return questions.filter((q) => q.tier === tier && (!unitId || q.unitId === unitId));
}

function latestUnitResults(unitId: string, userData: UserData): { answered: number; correct: number } {
  const unitQs = questions.filter((q) => q.unitId === unitId);
  const latest: Record<string, boolean> = {};
  for (const record of [...userData.answerRecords].reverse()) {
    if (unitQs.some((q) => q.id === record.questionId) && !(record.questionId in latest)) {
      latest[record.questionId] = record.isCorrect;
    }
  }
  const answered = Object.keys(latest).length;
  const correct = Object.values(latest).filter(Boolean).length;
  return { answered, correct };
}

export function unitPassed(unitId: string, userData: UserData): boolean {
  const { answered, correct } = latestUnitResults(unitId, userData);
  return answered >= 4 && correct / answered >= 0.8;
}

export function isUnitUnlocked(unitId: string, userData: UserData): boolean {
  void unitId;
  void userData;
  return true;
}

export function findNextUnit(userData: UserData): Unit | null {
  for (const unit of allUnits()) {
    if (!unitPassed(unit.id, userData)) return unit;
  }
  return null;
}

export function getUnitProgress(unitId: string, userData: UserData): { correctRate: number; weakPoints: string[] } {
  const unitQs = questions.filter((q) => q.unitId === unitId);
  if (unitQs.length === 0) {
    return { correctRate: 0, weakPoints: [] };
  }
  const { answered, correct } = latestUnitResults(unitId, userData);
  const correctRate = answered > 0 ? correct / answered : 0;
  const weakKps = new Set<string>();
  for (const q of unitQs) {
    const mark = userData.questionMarks[q.id];
    const srs = userData.srs[q.id];
    if (mark?.wrong || (srs && srs.stage < 3)) {
      weakKps.add(q.knowledgePointId);
    }
  }
  return { correctRate, weakPoints: Array.from(weakKps) };
}

export function sampleQuestions(list: Question[], count: number): Question[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    copy[i] = copy[j];
    copy[j] = current;
  }
  return copy.slice(0, count);
}
