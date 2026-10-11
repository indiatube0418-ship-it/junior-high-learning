'use client';

import { useEffect, useState } from 'react';
import { figures } from './catalog';
import { renderVisual } from './draw';

const CSS = `
.fig-dash { stroke-dasharray: 100; stroke-dashoffset: 100; animation: fig-dash 1.15s ease forwards; }
@keyframes fig-dash { to { stroke-dashoffset: 0; } }
.fig-pop { transform-box: fill-box; transform-origin: center; animation: fig-pop .55s cubic-bezier(.2,.8,.2,1) both; }
@keyframes fig-pop { from { opacity: 0; transform: translateY(12px) scale(.82); } to { opacity: 1; transform: none; } }
.fig-grow { transform-box: fill-box; transform-origin: left center; animation: fig-grow .85s ease both; }
@keyframes fig-grow { from { transform: scaleX(0.04); } to { transform: scaleX(1); } }
.fig-rise { transform-box: fill-box; transform-origin: center bottom; animation: fig-rise .85s ease both; }
@keyframes fig-rise { from { transform: scaleY(0.04); } to { transform: scaleY(1); } }
.fig-stage { animation: fig-stage .35s ease both; }
@keyframes fig-stage { from { opacity: .35; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .fig-dash { stroke-dashoffset: 0 !important; animation: none !important; }
  .fig-pop, .fig-grow, .fig-rise, .fig-stage { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

export function LessonFigure({
  knowledgePointId,
  step,
  compact = false,
}: {
  knowledgePointId: string;
  step: number;
  compact?: boolean;
}) {
  const entry = figures[knowledgePointId];
  const [play, setPlay] = useState(0);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setMotion(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const [localStep, setLocalStep] = useState(step);
  useEffect(() => {
    setLocalStep(step);
  }, [knowledgePointId, step]);

  if (!entry) return null;
  const shown = compact ? localStep : step;
  const safe = Math.max(0, Math.min(entry.captions.length - 1, shown));
  const last = entry.captions.length - 1;

  return (
    <figure className={compact ? 'mb-3' : 'mb-4'}>
      <style>{CSS}</style>
      <div className="mb-2 flex items-center justify-between gap-2">
        <figcaption className="text-sm font-bold text-[var(--fg)]">{entry.title}</figcaption>
        <button
          type="button"
          className="shrink-0 text-xs font-bold text-[var(--primary)]"
          onClick={() => setPlay((n) => n + 1)}
        >
          再看一次
        </button>
      </div>
      <div key={`${play}-${safe}`} className={compact ? 'fig-stage origin-top' : 'fig-stage'}>
        {renderVisual(entry.visual, safe, motion)}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5" aria-hidden="true">
        {entry.captions.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full ${i === safe ? 'w-6 bg-[var(--primary)]' : 'w-1.5 bg-[var(--border)]'}`}
          />
        ))}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--fg)]">{entry.captions[safe]}</p>
      {compact && last > 0 && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="btn btn-secondary flex-1 text-sm"
            disabled={safe === 0}
            onClick={() => setLocalStep((n) => Math.max(0, n - 1))}
          >
            上一格圖
          </button>
          <button
            type="button"
            className="btn btn-secondary flex-1 text-sm"
            disabled={safe === last}
            onClick={() => setLocalStep((n) => Math.min(last, n + 1))}
          >
            下一格圖
          </button>
        </div>
      )}
    </figure>
  );
}
