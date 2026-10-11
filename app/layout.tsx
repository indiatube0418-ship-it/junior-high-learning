import type { Metadata } from 'next';
import './globals.css';
import { UserDataProvider } from '@/lib/useUserData';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '國中學習平台',
  description: '從零教學到刷題複習，輕量養成遊戲',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" data-theme="japanese" suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--fg)] font-[var(--font-family)] antialiased min-h-screen flex flex-col">
        <UserDataProvider>
          <main className="flex-1 flex flex-col min-h-0 pb-[var(--bottom-nav-offset)]">
            {children}
          </main>
          <BottomNav />
        </UserDataProvider>
      </body>
    </html>
  );
}
