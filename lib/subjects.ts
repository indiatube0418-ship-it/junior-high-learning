import type { Subject } from './types';

export const SUBJECT_TABS: { id: Subject; label: string }[] = [
  { id: 'math', label: '數學' },
  { id: 'chinese', label: '國文' },
  { id: 'english', label: '英文' },
  { id: 'history', label: '歷史' },
  { id: 'geography', label: '地理' },
  { id: 'civics', label: '公民' },
  { id: 'biology', label: '生物' },
  { id: 'science', label: '理化' },
];

export function subjectLabel(subject: Subject): string {
  const found = SUBJECT_TABS.find((item) => item.id === subject);
  if (found) return found.label;
  if (subject === 'social') return '社會';
  return subject;
}

/** 舊網址的社會，改開歷史。 */
export function subjectFromQuery(value: string | null): Subject {
  if (value === 'social') return 'history';
  const found = SUBJECT_TABS.find((item) => item.id === value);
  return found ? found.id : 'math';
}
