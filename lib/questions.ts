/**
 * 題庫管理：目前僅國一上數學第1章
 * getQuestionsByTier 篩選難度/單元
 * getUnitProgress：正確率(最新答題)、弱點KP(有錯標或SRS stage<3)
 */

import mathData from '@/data/math-grade1-sem1-chapter1.json';
import type { Question, UserData, Tier } from './types';

export const questions: Question[] = mathData.questions as unknown as Question[];

const chapter = mathData.chapter;

export function getQuestionsByTier(tier: Tier, unitId?: string): Question[] {
  return questions.filter(q => q.tier === tier && (!unitId || q.unitId === unitId));
}

export function getUnitProgress(unitId: string, userData: UserData): { correctRate: number; weakPoints: string[] } {
  const unitQs = questions.filter(q => q.unitId === unitId);
  if (unitQs.length === 0) {
    return { correctRate: 0, weakPoints: [] };
  }

  // 最新答題紀錄
  const latestRecords: Record<string, boolean> = {};
  for (const record of userData.answerRecords.slice().reverse()) {
    if (unitQs.some(q => q.id === record.questionId) && !(record.questionId in latestRecords)) {
      latestRecords[record.questionId] = record.isCorrect;
    }
  }

  const answered = Object.keys(latestRecords).length;
  const correct = Object.values(latestRecords).filter(Boolean).length;
  const correctRate = answered > 0 ? correct / answered : 0;

  // 弱點：錯標或 SRS stage < 3
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
