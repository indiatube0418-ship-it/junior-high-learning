'use client';

import { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  rightSlot?: ReactNode;
}

export function TopBar({ title, rightSlot }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)] p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-[var(--fg)]">{title}</h1>
      {rightSlot}
    </header>
  );
}
