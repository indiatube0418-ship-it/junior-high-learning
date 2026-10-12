import { figures } from './catalog';
import { englishFromStep } from '@/lib/englishSpeech';

export function englishLineFor(knowledgePointId: string, step: number): string {
  const entry = figures[knowledgePointId];
  if (!entry || entry.voice !== 'language') return '';
  const safe = Math.max(0, Math.min(entry.captions.length - 1, step));
  const phase = entry.visual.type === 'flow'
    ? entry.visual.phases[Math.min(safe, entry.visual.phases.length - 1)]
    : undefined;
  return englishFromStep({
    boxes: phase?.boxes,
    result: phase?.result,
    caption: entry.captions[safe],
  });
}
