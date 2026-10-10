'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  active?: 'home' | 'learn' | 'practice' | 'pet' | 'map' | 'dashboard' | 'exam' | 'settings';
}

export function BottomNav({ active }: BottomNavProps) {
  const pathname = usePathname() ?? '/';

  const tabs = [
    { id: 'home' as const, href: '/', label: '首頁', icon: '🏠' },
    { id: 'learn' as const, href: '/learn', label: '學習', icon: '📚' },
    { id: 'practice' as const, href: '/practice', label: '練習', icon: '✏️' },
    { id: 'pet' as const, href: '/pet', label: '寵物', icon: '🐶' },
    { id: 'settings' as const, href: '/settings', label: '更多', icon: '⚙️' },
  ] as const;

  const currentActive = active || (pathname.split('?')[0].slice(1) as BottomNavProps['active'] || 'home');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card)]/80 backdrop-blur-md border-t border-[var(--border)] z-50 grid grid-cols-5 gap-2 p-2 pt-3 md:hidden">
      {tabs.map(({ id, href, label, icon }) => (
        <Link
          key={id}
          href={href}
          className={`btn flex-col gap-1 text-xs flex-1 ${currentActive === id ? 'text-[var(--primary)] scale-105 shadow-md' : 'text-[var(--muted)]'}`}
          aria-current={currentActive === id ? 'page' : undefined}
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
