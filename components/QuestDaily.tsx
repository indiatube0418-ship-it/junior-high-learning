'use client';

import { DailyQuest } from '@/lib/types';

interface QuestDailyProps {
  quests: DailyQuest[];
  onClaim: (id: string) => void;
}

export function QuestDaily({ quests, onClaim }: QuestDailyProps) {
  return (
    <div className="card space-y-3">
      <h3 className="text-lg font-bold flex items-center gap-2">📋 今日任務</h3>
      {quests.map(quest => {
        const progressPct = (quest.progress / quest.target) * 100;
        const canClaim = quest.progress >= quest.target && !quest.completed;
        return (
          <div key={quest.id} className="flex items-center justify-between p-3 bg-[var(--bg2)]/50 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
              <div>
                <p className="font-bold">{quest.title}</p>
                <p className="text-sm text-[var(--muted)]">{quest.progress}/{quest.target}</p>
              </div>
            </div>
            <div className="flex items-center shrink-0 ml-4">
              {quest.completed ? (
                <span className="px-4 py-2 text-sm font-bold text-[var(--accent)] bg-[var(--accent)]/10 rounded-lg flex items-center gap-1">
                  已領取 <span className="text-base">✓</span>
                </span>
              ) : canClaim ? (
                <button
                  className="btn whitespace-nowrap btn-primary px-4 py-2 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  onClick={() => onClaim(quest.id)}
                >
                  領取 {quest.reward.food}飼料
                </button>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-16 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div 
                      className="bg-[var(--primary)] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--muted)] font-medium">進行中</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
