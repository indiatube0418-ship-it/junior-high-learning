'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type BottomNavActive = 'home' | 'learn' | 'practice' | 'pet' | 'map' | 'dashboard' | 'exam' | 'settings';

interface BottomNavProps {
  active?: BottomNavActive;
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

  const pathnameClean = pathname.split('?')[0];
  const pathSegment = pathnameClean === '/' ? 'home' : pathnameClean.slice(1);
  const currentActive = (active || pathSegment) as BottomNavActive | 'home';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 gap-2 p-3 pt-4 bg-[var(--card)]/90 backdrop-blur-md border-t border-[var(--border)] md:hidden px-4 h-[72px + env(safe-area-inset-bottom)]">
      {tabs.map(({ id, href, label, icon }) => (
        <Link
          key={id}
          href={href}
          className={`btn flex flex-col gap-1 items-center text-xs flex-1 py-2 px-1 transition-all h-full justify-center ${
            currentActive === id
              ? 'text-[var(--primary)] scale-[1.05] shadow-md bg-[var(--primary)]/10 border-[var(--primary)] border'
              : 'text-[var(--muted)] hover:scale-[1.02]'
          }`}
          aria-current={currentActive === id ? 'page' : undefined}
        >
          <span className="text-xl">{icon}</span>
          <span className="leading-none">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
