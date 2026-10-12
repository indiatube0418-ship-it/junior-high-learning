import type { Subject } from './types';

export const SUBJECT_TABS: { id: Subject; label: string }[] = [
  { id: 'math', label: '數學' },
  { id: 'chinese', label: '國文' },
  { id: 'english', label: '英文' },
  { id: 'social', label: '社會' },
  { id: 'biology', label: '生物' },
];

export function subjectLabel(subject: Subject): string {
  const found = SUBJECT_TABS.find((item) => item.id === subject);
  if (found) return found.label;
  if (subject === 'science') return '自然';
  return subject;
}
