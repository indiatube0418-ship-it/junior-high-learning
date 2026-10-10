/**
 * 間隔重複工具：純函式，日期為 YYYY-MM-DD 字串
 * 間隔：1→3→7→14...，正確間隔*2，錯誤重置stage=1 interval=1
 */

import type { SrsState } from './types';

function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

function diffDays(from: string, to: string): number {
  return (parseDate(to).getTime() - parseDate(from).getTime()) / 86400000;
}

export function nextReviewDate(state: SrsState | null | undefined, isCorrect: boolean, today: string): SrsState {
  if (!state) {
    return { stage: 1, intervalDays: 1, dueDate: addDays(today, 1) };
  }

  let stage: 1 | 2 | 3;
  let intervalDays = state.intervalDays;

  if (isCorrect) {
    intervalDays *= 2;
    if (intervalDays === 2) intervalDays = 3;
    if (intervalDays === 6) intervalDays = 7;
    switch (state.stage) {
      case 1:
        stage = 2;
        break;
      case 2:
        stage = 3;
        break;
      case 3:
        stage = 3;
        break;
    }
  } else {
    stage = 1;
    intervalDays = 1;
  }

  const dueDate = addDays(today, intervalDays);
  return { stage, intervalDays, dueDate };
}

export function isDue(state: SrsState | null | undefined, today: string): boolean {
  if (!state) return true;
  return diffDays(state.dueDate, today) <= 0;
}
