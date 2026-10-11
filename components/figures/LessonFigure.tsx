'use client';

import { useEffect, useState } from 'react';
import { figures } from './catalog';
import { renderVisual } from './draw';
import { BEAT_LABELS, stepRole } from './guide';

const CSS = `
.fig-dash { stroke-dasharray: 100; stroke-dashoffset: 100; animation: fig-dash 1.15s ease forwards; }
@keyframes fig-dash { to { stroke-dashoffset: 0; } }
.fig-pop { transform-box: fill-box; transform-origin: center; animation: fig-pop .55s cubic-bezier(.2,.8,.2,1) both; }
@keyframes fig-pop { from { opacity: 0; transform: translateY(8px) scale(.9); } to { opacity: 1; transform: none; } }
.fig-grow { transform-box: fill-box; transform-origin: left center; animation: fig-grow .85s ease both; }
@keyframes fig-grow { from { transform: scaleX(0.04); } to { transform: scaleX(1); } }
.fig-rise { transform-box: fill-box; transform-origin: center bottom; animation: fig-rise .85s ease both; }
@keyframes fig-rise { from { transform: scaleY(0.04); } to { transform: scaleY(1); } }
.fig-pulse { transform-box: fill-box; transform-origin: center; animation: fig-pulse 1.05s ease-in-out .15s 2; }
@keyframes fig-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
.fig-dim { opacity: .4; }
@media (prefers-reduced-motion: reduce) {
  .fig-dash { stroke-dashoffset: 0 !important; animation: none !important; }
  .fig-pop, .fig-grow, .fig-rise, .fig-pulse { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

function speakZh(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-TW';
  utter.rate = 0.92;
  window.speechSynthesis.speak(utter);
}

export function LessonFigure({
  knowledgePointId,
  step,
  compact = false,
  lessonText,
}: {
  knowledgePointId: string;
  step: number;
  compact?: boolean;
  lessonText?: string;
}) {
  const entry = figures[knowledgePointId];
  const [play, setPlay] = useState(0);
  const [motion, setMotion] = useState(true);
  const [beat, setBeat] = useState(0);
  const [localStep, setLocalStep] = useState(step);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setMotion(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    setLocalStep(step);
  }, [knowledgePointId, step]);

  const shown = compact ? localStep : step;
  const safe = entry ? Math.max(0, Math.min(entry.captions.length - 1, shown)) : 0;
  const last = entry ? entry.captions.length - 1 : 0;
  const total = entry ? entry.captions.length : 1;
  const role = stepRole(safe, total);

  useEffect(() => {
    if (!entry) return;
    if (!motion) {
      setBeat(2);
      return;
    }
    setBeat(0);
    const t1 = window.setTimeout(() => setBeat(1), 900);
    const t2 = window.setTimeout(() => setBeat(2), 2200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [entry, knowledgePointId, safe, play, motion]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, []);

  if (!entry) return null;

  const replay = () => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setPlay((n) => n + 1);
  };

  const readAloud = () => {
    const parts = [`第 ${safe + 1} 步。${role.look}。`, entry.captions[safe]];
    if (lessonText) parts.push(lessonText);
    speakZh(parts.join(''));
  };

  return (
    <figure className={compact ? 'mb-3' : 'mb-2'}>
      <style>{CSS}</style>
      <div className="mb-2 flex items-center justify-between gap-2">
        <figcaption className="text-sm font-bold text-[var(--fg)]">{entry.title}</figcaption>
        <div className="flex shrink-0 gap-3">
          <button type="button" className="text-xs font-bold text-[var(--primary)]" onClick={readAloud}>
            唸這一步
          </button>
          <button type="button" className="text-xs font-bold text-[var(--primary)]" onClick={replay}>
            再看這一步
          </button>
        </div>
      </div>
      <p className="mb-2 text-xs font-bold text-[var(--accent)]">
        第 {safe + 1}／{total} 步 · {role.look}
      </p>
      <div className="mb-2 flex flex-wrap gap-1" aria-label="這一格的演示進度">
        {BEAT_LABELS.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-2 py-1 text-[11px] font-bold ${
              i === beat
                ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
                : i < beat
                  ? 'bg-[var(--primary-light)] text-[var(--fg)]'
                  : 'bg-[var(--bg2)] text-[var(--muted)]'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div key={`${play}-${safe}`}>
        {renderVisual(entry.visual, safe, motion, beat)}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5" aria-hidden="true">
        {entry.captions.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full ${i === safe ? 'w-6 bg-[var(--primary)]' : 'w-1.5 bg-[var(--border)]'}`}
          />
        ))}
      </div>
      <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--fg)]">{entry.captions[safe]}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{role.hint}</p>
      {lessonText && !compact && (
        <p className="mt-2 rounded-xl bg-[var(--bg2)] px-3 py-2 text-sm leading-relaxed">{lessonText}</p>
      )}
      {compact && last > 0 && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="btn btn-secondary flex-1 text-sm"
            disabled={safe === 0}
            onClick={() => setLocalStep((n) => Math.max(0, n - 1))}
          >
            上一步
          </button>
          <button
            type="button"
            className="btn btn-secondary flex-1 text-sm"
            disabled={safe === last}
            onClick={() => setLocalStep((n) => Math.min(last, n + 1))}
          >
            看懂了，下一步
          </button>
        </div>
      )}
    </figure>
  );
}
